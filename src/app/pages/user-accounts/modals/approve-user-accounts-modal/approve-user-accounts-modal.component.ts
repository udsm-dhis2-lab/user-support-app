import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { omit, flatten } from 'lodash';
import { Observable } from 'rxjs';
import { DataStoreDataService } from 'src/app/core/services/datastore.service';
import { MessagesAndDatastoreService } from 'src/app/core/services/messages-and-datastore.service';
import { UsersDataService } from 'src/app/core/services/users.service';
import { State } from 'src/app/store/reducers';
import { getCurrentTranslations } from 'src/app/store/selectors/translations.selectors';
import { DuplicateUserAccountsListModalComponent } from '../duplicate-user-accounts-list-modal/duplicate-user-accounts-list-modal.component';
import { SharedConfirmationModalComponent } from 'src/app/shared/modals/shared-confirmation-modal/shared-confirmation-modal.component';
import { getSystemConfigs } from 'src/app/store/selectors/system-configurations.selectors';

@Component({
  selector: 'app-approve-user-accounts-modal',
  templateUrl: './approve-user-accounts-modal.component.html',
  styleUrls: ['./approve-user-accounts-modal.component.css'],
})
export class ApproveUserAccountsModalComponent implements OnInit {
  dialogData: any;
  dataStoreInformation$: Observable<any>;
  saving: boolean = false;
  isCurrentUsernameValid: boolean = false;
  currentUsername: string;
  validityCheckMessage: string;
  translations$: Observable<any>;
  selectedRequestForApproval: any;
  checkingForPotentialDuplicates: boolean = false;
  potentialDuplicatesByUserRequest: any = {};
  systemSettings$: Observable<any>;
  canDelete: boolean;
  constructor(
    private dialogRef: MatDialogRef<ApproveUserAccountsModalComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private dataStoreDataService: DataStoreDataService,
    private usersDataService: UsersDataService,
    private messageAndDataStoreService: MessagesAndDatastoreService,
    private store: Store<State>,
    private dialog: MatDialog
  ) {
    this.dialogData = data;
  }

  ngOnInit(): void {
    // console.log(this.dialogData);

    this.systemSettings$ = this.store.select(getSystemConfigs);
    this.translations$ = this.store.select(getCurrentTranslations);
    this.getRequestInformation();
  }

  getRequestInformation(): void {
    this.dataStoreInformation$ = this.dataStoreDataService.getKeyData(
      this.dialogData?.request?.id
    );


    this.dataStoreInformation$.subscribe((response) => {
      const countOfUsersRemainedToCreate = (
        response?.payload?.filter(function (user) {
          return user?.status !== 'REJECTED' && user?.status !== 'CREATED';
        }) || []
      )?.length;
      this.canDelete = countOfUsersRemainedToCreate === 0;
      if (this.canDelete) {
        this.deleteDataStoreKey(response?.id);
      }
    })

  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onAccountApprove(
    event: Event,
    userToApprove: any,
    request: any,
    shouldUseTier2: boolean
  ): void {
    event.stopPropagation();
    if (shouldUseTier2) {
      this.saving = true;

      this.messageAndDataStoreService
        .searchMessageConversationByTicketNumber(
          this.dialogData?.request?.ticketNumber
        )
        .subscribe((response) => {
          if (response && response != 'none') {
            const messageConversation = response;
            const data = {
              id: request?.id,
              method: 'POST',
              userPayload: null,
              messageConversation: {
                ...messageConversation,
                approvalMessage: `I do confirm account for ${
                  userToApprove?.firstName + ' ' + userToApprove?.surname
                } whose phone number is ${
                  userToApprove?.phoneNumber
                } should be created`,
              },
              payload: {
                ...this.dialogData?.request,
                payload: request?.payload?.map((user) => {
                  if (user?.referenceId === userToApprove?.referenceId) {
                    return {
                      ...user,
                      status: 'APPROVED',
                      password:
                        this.dialogData?.configurations?.usersSettings
                          ?.defaultPassword,
                    };
                  } else {
                    return user;
                  }
                }),
              },
            };

            this.usersDataService.approveChanges(data).subscribe((response) => {
              if (response) {
                this.getRequestInformation();
                this.saving = false;
              }
            });
          } else {
            const messageBody = {
              subject: request?.message?.subject,
              users: [
                {
                  id: request?.user?.id,
                  username: request?.user?.username,
                  type: 'user',
                },
              ],
              userGroups: [],
              organisationUnits: [],
              text: `Approval for a request account message sent from you \n\n ${request?.message?.message}`,
              attachments: [],
            };

            const data = {
              id: request?.id,
              method: 'POST',
              userPayload: null,
              messageBody: messageBody,
              payload: {
                ...this.dialogData?.request,
                payload: request?.payload?.map((user) => {
                  if (user?.referenceId === userToApprove?.referenceId) {
                    return {
                      ...user,
                      status: 'APPROVED',
                      password:
                        this.dialogData?.configurations?.usersSettings
                          ?.defaultPassword,
                    };
                  } else {
                    return user;
                  }
                }),
              },
            };

            this.usersDataService.approveChanges(data).subscribe((response) => {
              if (response) {
                this.getRequestInformation();
                this.saving = false;
              }
            });
          }
        });
    } else {
      // this.onApprove(null, userToApprove, request);
      this.selectedRequestForApproval = userToApprove;
    }
  }

  onUpdateUser(event: Event, request: any): void {
    event.stopPropagation();
    // console.log(request);
    this.saving = true;

    this.messageAndDataStoreService
      .searchMessageConversationByTicketNumber(request?.ticketNumber)
      .subscribe((response) => {
        if (response && response != 'none') {
          const messageConversation = response;
          const data = {
            id: request?.id,
            method: request?.method,
            url: request?.url,
            privateMessage: request?.privateMessage,
            messageConversation: {
              ...messageConversation,
              approvalMessage: request?.replyMessage,
            },
            payload: request?.payload,
          };
          this.usersDataService.approveChanges(data).subscribe((response) => {
            if (response) {
              this.getRequestInformation();
              this.saving = false;
              setTimeout(() => {
                this.dialogRef.close(true);
              });
            }
          });
        } else {
          // Logic to first create approval message
        }
      });
  }

  onApprove(
    event: Event,
    userToApprove: any,
    request: any,
    actionType: string,
    systemSettings: any
  ): void {
    if (event) {
      event.stopPropagation();
    }
    // console.log('systemSettings', systemSettings);
    this.dialog
      .open(SharedConfirmationModalComponent, {
        minWidth: '20%',
        data: {
          title: `Confirm ${actionType.toLowerCase()} of the request`,
          message: `Are you sure to confirm ${actionType.toLowerCase()} of this request? ${
            actionType !== 'APPROVE'
              ? `If yes, provide reason for ${actionType.toLowerCase()}`
              : ''
          }`,
          color: actionType === 'APPROVE' ? 'primary' : 'warn',
          captureReason: actionType === 'APPROVE' ? false : true,
        },
      })
      .afterClosed()
      .subscribe((dialogResponse: any) => {
        if (dialogResponse?.confirmed || dialogResponse === true) {
          this.saving = true;
          // Create potential usernames
          const countOfUsersRemainedToCreate = (
            request?.payload?.filter((user) => user?.status !== 'CREATED' || user?.status !== 'REJECTED') || []
          )?.length;



          this.messageAndDataStoreService
            .searchMessageConversationByTicketNumber(
              this.dialogData?.request?.ticketNumber
            )
            .subscribe((response) => {
              if (response) {
                const messageConversation = response;
                if (actionType === 'APPROVE') {
                  // console.log('messageConversation', messageConversation);
                  let usersCount = 1;
                  const selectedUsername = this.currentUsername;
                  const message = {
                    subject: this.dialogData?.request?.message?.subject,
                    messageType: 'TICKET',
                    users: [
                      {
                        id: this.dialogData?.request?.user?.id,
                        username: this.dialogData?.request?.user?.username,
                        type: 'user',
                      },
                    ],
                    userGroups: [
                      {
                        id: systemSettings?.feedbackRecipients?.id,
                      },
                    ],
                    organisationUnits: [],
                    text: `The following are the accounts created \n\n ${usersCount}. ${
                      userToApprove?.firstName +
                      ' ' +
                      userToApprove?.surname +
                      '  - ' +
                      userToApprove?.phoneNumber
                    }  is: username=  ${selectedUsername} and password = ${
                      this.dialogData?.configurations?.usersSettings
                        ?.defaultPassword
                    }\n ${(
                      request?.payload?.filter((user) => user?.username) || []
                    )
                      ?.map((userPayload, index) => {
                        console.log('userPayload', userPayload);
                        usersCount = usersCount + 1;
                        return (
                          usersCount +
                          '. ' +
                          userPayload?.firstName +
                          ' ' +
                          userPayload?.surname +
                          ' - ' +
                          userPayload?.phoneNumber +
                          (userPayload?.username && userPayload?.password
                            ? ', user name is ' +
                              userPayload?.username +
                              ' and password is ' +
                              userPayload?.password
                            : '')
                        );
                      })
                      .join('\n')}`,
                    attachments: [],
                  };
                  if (this.currentUsername) {
                    const data = {
                      id: request?.id,
                      method: 'POST',
                      userPayload: omit(
                        {
                          ...userToApprove,
                          userCredentials: {
                            ...userToApprove?.userCredentials,
                            password:
                              this.dialogData?.configurations?.usersSettings
                                ?.defaultPassword,
                            username: selectedUsername,
                            userRoles:
                              (
                                flatten(
                                  (
                                    userToApprove?.userCredentials?.userRoles?.filter(
                                      (role) => role?.id != ''
                                    ) || []
                                  )?.map((userRole: any) => {
                                    return flatten(
                                      (
                                        this.dialogData?.configurations?.allowedUserRolesForRequest?.filter(
                                          (role: any) =>
                                            role?.id === userRole?.id
                                        ) || []
                                      )?.map(
                                        (configuredRole: any) =>
                                          configuredRole?.associatedRoles || []
                                      ) || []
                                    );
                                  })
                                ) || []
                              )?.map((role: any) => {
                                return {
                                  id: role?.id,
                                };
                              }) || [],
                          },
                          userGroups:
                            (
                              flatten(
                                (
                                  userToApprove?.userGroups?.filter(
                                    (group) => group?.id != ''
                                  ) || []
                                )?.map((userGroup: any) => {
                                  return flatten(
                                    (
                                      this.dialogData?.configurations?.allowedUserGroupsForRequest?.filter(
                                        (group: any) =>
                                          group?.id === userGroup?.id
                                      ) || []
                                    )?.map(
                                      (configuredGroup: any) =>
                                        configuredGroup?.associatedGroups || []
                                    ) || []
                                  );
                                })
                              ) || []
                            )?.map((group: any) => {
                              return {
                                id: group?.id,
                              };
                            }) || [],
                          dataViewOrganisationUnits:
                            userToApprove?.dataViewOrganisationUnits?.length > 0
                              ? userToApprove?.dataViewOrganisationUnits?.map(
                                  (ou) => {
                                    return {
                                      id: ou?.id,
                                    };
                                  }
                                )
                              : [
                                  {
                                    id: request?.user?.organisationUnits[0]?.id,
                                  },
                                ],
                          organisationUnits:
                            userToApprove?.organisationUnits?.length > 0
                              ? userToApprove?.organisationUnits?.map((ou) => {
                                  return {
                                    id: ou?.id,
                                  };
                                })
                              : [
                                  {
                                    id: request?.user?.organisationUnits[0]?.id,
                                  },
                                ],
                        },
                        ['referenceId', 'status', 'username', 'password']
                      ),
                      messageConversation:
                        response != 'none'
                          ? {
                              ...messageConversation,
                              approvalMessage: `The following are the accounts created \n\n ${usersCount}. ${
                                userToApprove?.firstName +
                                ' ' +
                                userToApprove?.surname +
                                '  - ' +
                                userToApprove?.phoneNumber
                              }  is: username=  ${selectedUsername} and password = ${
                                this.dialogData?.configurations?.usersSettings
                                  ?.defaultPassword
                              }\n ${(
                                request?.payload?.filter(
                                  (user) => user?.username
                                ) || []
                              )
                                ?.map((userPayload, index) => {
                                  console.log('userPayload', userPayload);

                                  usersCount = usersCount + 1;
                                  return (
                                    usersCount +
                                    '. ' +
                                    userPayload?.firstName +
                                    ' ' +
                                    userPayload?.surname +
                                    ' - ' +
                                    userPayload?.phoneNumber +
                                    ', user name is ' +
                                    userPayload?.username +
                                    ' and password is ' +
                                    userPayload?.password
                                  );
                                })
                                .join('\n')}`,
                            }
                          : null,
                      messageBody: message,
                      payload: {
                        ...this.dialogData?.request,
                        payload: request?.payload?.map((user) => {
                          if (
                            user?.referenceId === userToApprove?.referenceId
                          ) {
                            return {
                              ...user,
                              status: 'CREATED',
                              username: selectedUsername,
                              password:
                                this.dialogData?.configurations?.usersSettings
                                  ?.defaultPassword,
                            };
                          } else {
                            return user;
                          }
                        }),
                      },
                    };
                    this.usersDataService
                      .approveChanges(data)
                      .subscribe((response) => {
                        if (response) {
                          this.currentUsername = null;
                          // If datastore key is complete please delete
                          if (countOfUsersRemainedToCreate == 1) {
                            // delete first
                           // Example usage
                          this.deleteDataStoreKey(request?.id);

                          } else {
                            this.getRequestInformation();
                            this.saving = false;
                          }
                        }
                      });
                  } else {
                    this.saving = false;
                  }
                } else {
                  // Reject user
                  const message = {
                    subject: this.dialogData?.request?.message?.subject,
                    messageType: 'TICKET',
                    users: [
                      {
                        id: this.dialogData?.request?.user?.id,
                        username: this.dialogData?.request?.user?.username,
                        type: 'user',
                      },
                    ],
                    userGroups: [
                      {
                        id: systemSettings?.feedbackRecipients?.id,
                      },
                    ],
                    organisationUnits: [],
                    text: `The account ${
                      userToApprove?.firstName +
                      ' ' +
                      userToApprove?.surname +
                      '  - ' +
                      userToApprove?.phoneNumber
                    } ${
                      userToApprove?.email
                        ? '(' + userToApprove?.email + ')'
                        : ''
                    }) was confirmed to be rejected by reason: ${
                      dialogResponse?.reason
                    }  \n\n \n ${(
                      request?.payload?.filter(
                        (userRequest: any) =>
                          userRequest?.referenceId !==
                          userToApprove?.referenceId
                      ) || []
                    )
                      ?.map((userPayload, index) => {
                        console.log('userPayload', userPayload);
                        return (
                          index +
                          1 +
                          '. ' +
                          userPayload?.firstName +
                          ' ' +
                          userPayload?.surname +
                          ' - ' +
                          userPayload?.phoneNumber +
                          (userPayload?.username && userPayload?.password
                            ? ', user name is ' +
                              userPayload?.username +
                              ' and password is ' +
                              userPayload?.password
                            : '')
                        );
                      })
                      .join('\n')}`,
                    attachments: [],
                  };
                  let usersCount = 0;
                  // console.log('RESPONSE TEST', response);
                  const data = {
                    id: request?.id,
                    method: 'POST',
                    userPayload: null,
                    messageConversation:
                      response != 'none'
                        ? {
                            ...messageConversation,
                            approvalMessage: `The account ${
                              userToApprove?.firstName +
                              ' ' +
                              userToApprove?.surname +
                              '  - ' +
                              userToApprove?.phoneNumber
                            } ${
                              userToApprove?.email
                                ? '(' + userToApprove?.email + ')'
                                : ''
                            }) was confirmed to be rejected by reason: ${
                              dialogResponse?.reason
                            }  \n\n \n ${(
                              request?.payload?.filter(
                                (userRequest: any) =>
                                  userRequest?.referenceId !==
                                  userToApprove?.referenceId
                              ) || []
                            )
                              ?.map((userPayload, index) => {
                                console.log('userPayload', userPayload);
                                usersCount = usersCount + 1;
                                return (
                                  usersCount +
                                  '. ' +
                                  userPayload?.firstName +
                                  ' ' +
                                  userPayload?.surname +
                                  ' - ' +
                                  userPayload?.phoneNumber +
                                  ', user name is ' +
                                  userPayload?.username +
                                  ' and password is ' +
                                  userPayload?.password
                                );
                              })
                              .join('\n')}`,
                          }
                        : null,
                    messageBody: message,
                    payload: {
                      ...this.dialogData?.request,
                      payload: request?.payload?.map((user) => {
                        if (user?.referenceId === userToApprove?.referenceId) {
                          return {
                            ...user,
                            status: 'REJECTED',
                            reason: dialogResponse?.reason,
                            username: null,
                            password: null,
                          };
                        } else {
                          return user;
                        }
                      }),
                    },
                  };
                  this.usersDataService
                    .approveChanges(data)
                    .subscribe((response) => {
                      if (response) {
                        this.currentUsername = null;
                        // If datastore key is complete please delete
                        if (countOfUsersRemainedToCreate == 1) {
                          // delete first
                       // Example usage
                      this.deleteDataStoreKey(request?.id);

                        } else {
                          this.getRequestInformation();
                          this.saving = false;
                        }
                      }
                    });
                }
              } else {
                const selectedUsername = this.currentUsername;
                if (selectedUsername) {
                  let usersCount = 1;
                  const messageBody = {
                    subject: request?.message?.subject,
                    users: [
                      {
                        id: request?.user?.id,
                        username: request?.user?.username,
                        type: 'user',
                      },
                    ],
                    userGroups: [],
                    organisationUnits: [],
                    text: `The following are the accounts created \n\n ${usersCount}. ${
                      userToApprove?.firstName +
                      ' ' +
                      userToApprove?.surname +
                      '  - Phone No.: ' +
                      userToApprove?.phoneNumber +
                      'and Email address: ' +
                      userToApprove?.email
                    }  is: username=  ${selectedUsername} and password = ${
                      this.dialogData?.configurations?.usersSettings
                        ?.defaultPassword
                    }\n ${(
                      request?.payload?.filter((user) => user?.username) || []
                    )
                      ?.map((userPayload, index) => {
                        console.log('userPayload', userPayload);
                        usersCount = usersCount + 1;
                        return (
                          usersCount + '. ' +
                          userPayload?.firstName +
                          ' ' +
                          userPayload?.surname +
                          ' - Phone No.: ' +
                          userPayload?.phoneNumber +
                          ' and Email address ' +
                          userPayload?.email +
                          ', user name is ' +
                          userPayload?.username +
                          ' and password is ' +
                          userPayload?.password
                        );
                      })
                      .join('\n')}`,
                    attachments: [],
                  };
                  const data = {
                    id: request?.id,
                    method: 'POST',
                    userPayload: omit(
                      {
                        ...userToApprove,
                        userCredentials: {
                          ...userToApprove?.userCredentials,
                          password:
                            this.dialogData?.configurations?.usersSettings
                              ?.defaultPassword,
                          username: selectedUsername,
                          userRoles:
                            userToApprove?.userCredentials?.userRoles?.filter(
                              (role) => role?.id != ''
                            ) || [
                              {
                                id: 'ZI4hVQsL7Dq',
                              },
                            ],
                        },
                        userGroups: [
                          ...userToApprove?.userGroups,
                          ...flatten(
                            (
                              this.dialogData?.configurations?.allowedUserGroupsForRequest?.filter(
                                (group) =>
                                  userToApprove?.userGroups[0] &&
                                  userToApprove?.userGroups[0]?.id === group?.id
                              ) || []
                            )?.map((userGroup) => {
                              return userGroup?.associatedGroups &&
                                userGroup?.associatedGroups?.length > 0
                                ? userGroup?.associatedGroups.map((group) => {
                                    return !group?.id
                                      ? null
                                      : {
                                          id: group?.id,
                                        };
                                  })
                                : [];
                            })
                          ),
                        ]?.filter((group) => group && group?.id != '') || [
                          {
                            id: 'zk2Zubvm2kP',
                          },
                        ],
                        dataViewOrganisationUnits:
                          userToApprove?.dataViewOrganisationUnits?.length > 0
                            ? userToApprove?.dataViewOrganisationUnits?.map(
                                (ou) => {
                                  return {
                                    id: ou?.id,
                                  };
                                }
                              )
                            : [{ id: request?.user?.organisationUnits[0]?.id }],
                        organisationUnits:
                          userToApprove?.organisationUnits?.length > 0
                            ? userToApprove?.organisationUnits?.map((ou) => {
                                return {
                                  id: ou?.id,
                                };
                              })
                            : [{ id: request?.user?.organisationUnits[0]?.id }],
                      },
                      ['referenceId', 'status', 'username', 'password']
                    ),
                    messageBody,
                    payload: {
                      ...this.dialogData?.request,
                      payload: request?.payload?.map((user) => {
                        if (user?.referenceId === userToApprove?.referenceId) {
                          return {
                            ...user,
                            status: 'CREATED',
                            username: selectedUsername,
                            password: userToApprove?.userCredentials?.password,
                          };
                        } else {
                          return user;
                        }
                      }),
                    },
                  };
                  this.usersDataService
                    .approveChanges(data)
                    .subscribe((response) => {
                      if (response) {
                        this.currentUsername = null;
                        // If datastore key is complete please delete
                        if (countOfUsersRemainedToCreate == 1) {
                          // delete first
                          // Example usage
                          this.deleteDataStoreKey(request?.id);

                        } else {
                          this.getRequestInformation();
                          this.saving = false;
                        }
                      }
                    });
                } else {
                  this.saving = false;
                }
              }
            });
        } else {
          // Cancelled
          // this.getRequestInformation();
        }
      });
  }

  onGetUsernameData(username: string): void {
    this.currentUsername = username;
  }
  onGetUsernameValidity(isValid: boolean): void {
    this.isCurrentUsernameValid = isValid;
  }

  onGetvalidityCheckMessage(message: string): void {
    this.validityCheckMessage = message;
  }

  deleteDataStoreKey(requestId: string): void {
    this.saving = true; // Set saving to true to indicate a save operation is in progress
    this.dataStoreDataService.deleteDataStoreKey(requestId).subscribe(
      (response) => {
        this.getRequestInformation();
        this.saving = false;
        setTimeout(() => {
          this.dialogRef.close(true);
        });
      },
      (error) => {
        this.saving = false;
        // Handle error if needed
      }
    );
  }

  onCheckPotentialDuplicate(event: Event, userDetails: any): void {
    event.stopPropagation();
    this.checkingForPotentialDuplicates = true;
    this.usersDataService
      .getUsersByEmailAndPhoneNumber(
        userDetails?.email,
        userDetails?.phoneNumber
      )
      .subscribe((potentialDuplicates: any[]) => {
        this.checkingForPotentialDuplicates = false;
        this.potentialDuplicatesByUserRequest[userDetails?.referenceId] =
          potentialDuplicates;
      });
  }

  onViewPotentialDuplicates(event: Event, potentialDuplicates: any[]): void {
    event.stopPropagation();
    this.dialog.open(DuplicateUserAccountsListModalComponent, {
      minWidth: '40%',
      data: potentialDuplicates,
    });
  }

  onDelete(request: any): void {
    this.deleteDataStoreKey(request?.id);
  }
}
