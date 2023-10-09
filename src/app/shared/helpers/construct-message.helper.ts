export function constructMessageForFacilityAssignment(
  assignmentDetails: any,
  keywordsKeys: any
) {
  let message = '';
  message +=
    assignmentDetails?.additions?.length > 0 ||
    assignmentDetails?.programs?.additions?.length > 0
      ? (keywordsKeys && keywordsKeys['addMessageFormRequest']
          ? keywordsKeys['addMessageFormRequest']
          : `Please add the following dataset/program on the org unit`) +
        `: ${
          assignmentDetails?.organisationUnit?.name +
          ' - ' +
          assignmentDetails?.organisationUnit?.parent?.name +
          (assignmentDetails?.organisationUnit?.parent?.parent &&
          assignmentDetails?.organisationUnit?.parent?.parent?.name
            ? ', ' + assignmentDetails?.organisationUnit?.parent?.parent?.name
            : '')
        } \n` +
        [
          ...assignmentDetails?.additions,
          ...assignmentDetails?.programs?.additions,
        ]
          .map((addition, index) => {
            const dataSetAttributesDataInfo =
              assignmentDetails?.dataSetAttributesData?.filter(
                (attrInfo) => attrInfo?.dataSet?.id === addition?.id
              ) || [];
            return (
              index +
              1 +
              '. ' +
              addition?.type?.toUpperCase() +
              ': ' +
              addition?.name +
              (dataSetAttributesDataInfo?.length > 0
                ? ' (' +
                  formulateFormAttributeMessage(
                    dataSetAttributesDataInfo,
                    addition,
                    keywordsKeys
                  ) +
                  ')'
                : '')
            );
          })
          .join(',\n')
      : '';

  message +=
    assignmentDetails?.additions?.length > 0 ||
    assignmentDetails?.programs?.additions?.length > 0
      ? '\n\n'
      : '';

  message +=
    assignmentDetails?.deletions?.length > 0 ||
    assignmentDetails?.programs?.deletions?.length > 0
      ? (keywordsKeys && keywordsKeys['removeMessageFormRequest']
          ? keywordsKeys['removeMessageFormRequest']
          : `Naomba kuondolewa fomu zifuatazo kwenye kituo`) +
        `: ${
          assignmentDetails?.organisationUnit?.name +
          ' - ' +
          assignmentDetails?.organisationUnit?.parent?.name +
          (assignmentDetails?.organisationUnit?.parent?.parent &&
          assignmentDetails?.organisationUnit?.parent?.parent?.name
            ? ', ' + assignmentDetails?.organisationUnit?.parent?.parent?.name
            : '')
        } \n` +
        [
          ...assignmentDetails?.deletions,
          ...assignmentDetails?.programs?.deletions,
        ]
          .map((deletion, index) => {
            const dataSetAttributesDataInfo =
              assignmentDetails?.dataSetAttributesData?.filter(
                (attrInfo) => attrInfo?.dataSet?.id === deletion?.id
              ) || [];
            return (
              index +
              1 +
              '. ' +
              deletion?.type?.toUpperCase() +
              ': ' +
              deletion?.name +
              (dataSetAttributesDataInfo?.length > 0
                ? ' (' +
                  formulateFormAttributeMessage(
                    dataSetAttributesDataInfo,
                    deletion,
                    keywordsKeys
                  ) +
                  ')'
                : '')
            );
          })
          .join(',\n')
      : '';
  return {
    subject:
      assignmentDetails?.ticketNumber +
      ' - ' +
      (keywordsKeys && keywordsKeys['messageRequestHeader']
        ? keywordsKeys['formRequestMessageHeaderKey']
        : 'MAOMBI YA FOMU'),
    message,
  };
}

export function constructMessageForDataSetAssignment(
  assignmentDetails: any,
  keywordsKeys: any
) {
  let message = '';
  message +=
    assignmentDetails?.additions?.length > 0
      ? (keywordsKeys && keywordsKeys['addMessageFacilitiesFormRequestKey']
          ? keywordsKeys['addMessageFacilitiesFormRequestKey']
          : `Naomba kuongezewa vituo vifuatavyo kwenye fomu `) +
        ' ' +
        assignmentDetails?.type?.toUpperCase() +
        ' : ' +
        `${
          assignmentDetails?.dataSet
            ? assignmentDetails?.dataSet?.name
            : assignmentDetails?.reportingTool?.name
        }:- \n` +
        assignmentDetails?.additions
          .map((addition, index) => {
            return index + 1 + '. ' + addition?.name;
          })
          .join(',\n')
      : '';

  message += assignmentDetails?.additions?.length > 0 ? '\n\n' : '';
  message +=
    assignmentDetails?.deletions?.length > 0
      ? (keywordsKeys && keywordsKeys['removeMessageFacilitiesFormRequestKey']
          ? keywordsKeys['removeMessageFacilitiesFormRequestKey']
          : `Naomba kuondolewa vituo vifuatavyo kwenye fomu `) +
        ' ' +
        assignmentDetails?.type?.toUpperCase() +
        ' : ' +
        `${
          assignmentDetails?.dataSet
            ? assignmentDetails?.dataSet?.name
            : assignmentDetails?.reportingTool?.name
        } \n` +
        assignmentDetails?.deletions
          .map((deletion, index) => {
            return index + 1 + '. ' + deletion?.name;
          })
          .join(',\n')
      : '';
  return {
    subject:
      assignmentDetails?.ticketNumber +
      ' - ' +
      (keywordsKeys && keywordsKeys['messageRequestHeader']
        ? keywordsKeys['formRequestMessageHeaderKey']
        : 'MAOMBI YA FOMU'),
    message,
  };
}

export function getDataStoreDetailsForFormRequestsByDataSet(
  assignmentDetails: any,
  keywordsKeys: any
): any {
  let action = '';
  action +=
    assignmentDetails?.deletions?.length > 0 ||
    assignmentDetails?.programs?.deletions?.length > 0
      ? (keywordsKeys && keywordsKeys['Remove']
          ? keywordsKeys['Remove']
          : 'Remove') +
        ' ' +
        (assignmentDetails?.deletions?.length +
          (assignmentDetails?.programs
            ? assignmentDetails?.deletions?.length
            : 0)) +
        (keywordsKeys && keywordsKeys['organisationunits from']
          ? ' ' + keywordsKeys['organisationunits from'] + ' '
          : ' organisationunits from ') +
        (assignmentDetails?.dataSet
          ? assignmentDetails?.dataSet?.name
          : assignmentDetails?.reportingTool?.name)
      : '';

  action +=
    (assignmentDetails?.deletions?.length > 0 &&
      assignmentDetails?.additions?.length > 0) ||
    (assignmentDetails?.programs?.deletions?.length > 0 &&
      assignmentDetails?.programs?.additions?.length > 0)
      ? ' ' +
        (keywordsKeys && keywordsKeys['and'] ? keywordsKeys['and'] : 'and') +
        ' '
      : '';

  action +=
    assignmentDetails?.additions?.length > 0 ||
    assignmentDetails?.programs?.additions?.length > 0
      ? (keywordsKeys && keywordsKeys['Assign']
          ? keywordsKeys['Assign']
          : 'Assign') +
        ' ' +
        (assignmentDetails?.additions?.length +
          (assignmentDetails?.programs
            ? assignmentDetails?.programs?.additions?.length
            : 0)) +
        (keywordsKeys && keywordsKeys['organisationunits to']
          ? ' ' + keywordsKeys['organisationunits to']
          : 'organisationunits to') +
        ' ' +
        (assignmentDetails?.dataSet
          ? assignmentDetails?.dataSet?.name
          : assignmentDetails?.reportingTool?.name)
      : '';

  let replyMessage = '';
  replyMessage +=
    assignmentDetails?.deletions?.length > 0 ||
    assignmentDetails?.programs?.deletions?.length > 0
      ? (keywordsKeys && keywordsKeys['Removed']
          ? keywordsKeys['Removed']
          : 'Removed') +
        ' ' +
        (assignmentDetails?.deletions?.length +
          (assignmentDetails?.programs
            ? assignmentDetails?.programs?.deletions?.length
            : 0)) +
        (keywordsKeys && keywordsKeys['organisationunits from the form']
          ? ' ' + keywordsKeys['organisationunits from the form']
          : ' organisationunits from the form') +
        ' ' +
        (assignmentDetails?.dataSet
          ? assignmentDetails?.dataSet?.name
          : assignmentDetails?.reportingTool?.name)
      : '';

  replyMessage +=
    (assignmentDetails?.deletions?.length > 0 &&
      assignmentDetails?.additions?.length > 0) ||
    (assignmentDetails?.programs?.deletions?.length > 0 &&
      assignmentDetails?.programs?.additions?.length > 0)
      ? (keywordsKeys && keywordsKeys['and']
          ? ' ' + keywordsKeys['and']
          : ' and') + ' '
      : '';

  replyMessage +=
    assignmentDetails?.additions?.length > 0 ||
    assignmentDetails?.programs?.additions?.length > 0
      ? (keywordsKeys && keywordsKeys['Assigned']
          ? keywordsKeys['Assigned']
          : 'Assigned') +
        ' ' +
        (assignmentDetails?.additions?.length +
          (assignmentDetails?.programs
            ? assignmentDetails?.programs?.additions?.length
            : 0)) +
        (keywordsKeys && keywordsKeys['organisationunits to the form']
          ? ' ' + keywordsKeys['organisationunits to the form']
          : ' organisationunits to the form') +
        ' ' +
        (assignmentDetails?.dataSet
          ? assignmentDetails?.dataSet?.name
          : assignmentDetails?.reportingTool?.name)
      : '';

  return {
    action: action,
    replyMessage: replyMessage,
    ticketNumber: assignmentDetails?.ticketNumber,
    method: 'POST',
    payload: {
      deletions:
        assignmentDetails?.deletions?.length > 0
          ? assignmentDetails?.deletions.map((deletion) => {
              return {
                id: deletion?.id,
                name: deletion?.name,
              };
            })
          : [],
      additions:
        assignmentDetails?.additions?.length > 0
          ? assignmentDetails?.additions.map((addition) => {
              return {
                id: addition?.id,
                name: addition?.name,
              };
            })
          : [],
    },
    programsPayload: assignmentDetails?.programs
      ? {
          deletions:
            assignmentDetails?.programs?.deletions?.length > 0
              ? assignmentDetails?.deletions.map((deletion) => {
                  return {
                    id: deletion?.id,
                    name: deletion?.name,
                  };
                })
              : [],
          additions:
            assignmentDetails?.programs?.additions?.length > 0
              ? assignmentDetails?.additions.map((addition) => {
                  return {
                    id: addition?.id,
                    name: addition?.name,
                  };
                })
              : [],
        }
      : null,
    programsUrl: `programs/${
      assignmentDetails?.program?.id
    }/organisationUnits.json?cache=${assignmentDetails?.ticketNumber.replace(
      'DS',
      ''
    )}`,
    url: `${assignmentDetails?.type !== 'program' ? 'dataSets' : 'programs'}/${
      assignmentDetails?.dataSet
        ? assignmentDetails?.dataSet?.id
        : assignmentDetails?.reportingTool?.id
    }/organisationUnits.json?cache=${assignmentDetails?.ticketNumber.replace(
      'DS',
      ''
    )}`,
  };
}

export function getDataStoreDetailsForFormRequests(
  assignmentDetails: any,
  keywordsKeys
): any {
  // console.log('keywordsKeys', keywordsKeys);
  let action = '';
  action +=
    assignmentDetails?.deletions?.length > 0 ||
    assignmentDetails?.programs?.deletions?.length > 0
      ? (keywordsKeys && keywordsKeys['Remove']
          ? keywordsKeys['Remove']
          : 'Remove') +
        ' ' +
        (assignmentDetails?.deletions?.length +
          (assignmentDetails?.programs
            ? assignmentDetails?.programs?.deletions?.length
            : 0)) +
        (keywordsKeys && keywordsKeys['datasets from']
          ? keywordsKeys['datasets from']
          : ' datasets/programs from') +
        '  ' +
        assignmentDetails?.organisationUnit?.name +
        ' - ' +
        assignmentDetails?.organisationUnit?.parent?.name +
        (assignmentDetails?.organisationUnit?.parent?.parent &&
        assignmentDetails?.organisationUnit?.parent?.parent?.name
          ? ', ' + assignmentDetails?.organisationUnit?.parent?.parent?.name
          : '')
      : '';

  action +=
    (assignmentDetails?.deletions?.length > 0 ||
      assignmentDetails?.programs?.deletions?.length > 0) &&
    (assignmentDetails?.additions?.length > 0 ||
      assignmentDetails?.programs?.additions?.length > 0)
      ? ' ' +
        (keywordsKeys && keywordsKeys['and'] ? keywordsKeys['and'] : 'and') +
        ' '
      : '';

  action +=
    assignmentDetails?.additions?.length > 0 ||
    assignmentDetails?.programs?.additions?.length > 0
      ? (keywordsKeys && keywordsKeys['Assign']
          ? keywordsKeys['Assign']
          : 'Assign') +
        ' ' +
        (assignmentDetails?.additions?.length +
          assignmentDetails?.programs?.additions?.length) +
        ' ' +
        (keywordsKeys && keywordsKeys['datasets to']
          ? keywordsKeys['datasets to']
          : 'datasets/programs to') +
        ' ' +
        assignmentDetails?.organisationUnit?.name +
        ' - ' +
        assignmentDetails?.organisationUnit?.parent?.name +
        (assignmentDetails?.organisationUnit?.parent?.parent &&
        assignmentDetails?.organisationUnit?.parent?.parent?.name
          ? ', ' + assignmentDetails?.organisationUnit?.parent?.parent?.name
          : '')
      : '';

  let replyMessage = '';
  replyMessage +=
    assignmentDetails?.deletions?.length > 0 ||
    assignmentDetails?.programs?.deletions?.length > 0
      ? (keywordsKeys && keywordsKeys['Removed']
          ? keywordsKeys['Removed']
          : 'Removed') +
        ' ' +
        (assignmentDetails?.deletions?.length +
          (assignmentDetails?.programs
            ? assignmentDetails?.programs?.deletions?.length
            : 0)) +
        ' ' +
        (keywordsKeys && keywordsKeys['datasets from']
          ? keywordsKeys['datasets from']
          : 'datasets/programs from') +
        ' ' +
        assignmentDetails?.organisationUnit?.name +
        ' - ' +
        assignmentDetails?.organisationUnit?.parent?.name +
        (assignmentDetails?.organisationUnit?.parent?.parent &&
        assignmentDetails?.organisationUnit?.parent?.parent?.name
          ? ', ' + assignmentDetails?.organisationUnit?.parent?.parent?.name
          : '')
      : '';

  replyMessage +=
    (assignmentDetails?.programs?.deletions?.length > 0 ||
      assignmentDetails?.programs?.deletions?.length > 0) &&
    (assignmentDetails?.additions?.length > 0 ||
      assignmentDetails?.programs?.additions?.length > 0)
      ? ' ' +
        (keywordsKeys && keywordsKeys['and'] ? keywordsKeys['and'] : 'and') +
        ' '
      : '';

  replyMessage +=
    assignmentDetails?.additions?.length > 0 ||
    assignmentDetails?.programs?.additions?.length > 0
      ? (keywordsKeys && keywordsKeys['Assigned']
          ? keywordsKeys['Assigned']
          : 'Assigned') +
        ' ' +
        (assignmentDetails?.additions?.length +
          (assignmentDetails?.programs
            ? assignmentDetails?.programs?.additions?.length
            : 0)) +
        ' ' +
        (keywordsKeys && keywordsKeys['datasets to']
          ? keywordsKeys['datasets to']
          : 'datasets/programs to') +
        ' ' +
        assignmentDetails?.organisationUnit?.name +
        ' - ' +
        assignmentDetails?.organisationUnit?.parent?.name +
        (assignmentDetails?.organisationUnit?.parent?.parent &&
        assignmentDetails?.organisationUnit?.parent?.parent?.name
          ? ', ' + assignmentDetails?.organisationUnit?.parent?.parent?.name
          : '')
      : '';
  return action && action?.length > 5
    ? {
        action: action,
        replyMessage: replyMessage,
        ticketNumber: assignmentDetails?.ticketNumber,
        method: 'POST',
        payload: {
          deletions:
            assignmentDetails?.deletions?.length > 0
              ? assignmentDetails?.deletions.map((deletion) => {
                  return {
                    id: deletion?.id,
                    name: deletion?.name,
                  };
                })
              : [],
          additions:
            assignmentDetails?.additions?.length > 0
              ? assignmentDetails?.additions.map((addition) => {
                  return {
                    id: addition?.id,
                    name: addition?.name,
                  };
                })
              : [],
          dataSetAttributesData: assignmentDetails?.dataSetAttributesData,
        },
        programsPayload: {
          deletions:
            assignmentDetails?.programs?.deletions?.length > 0
              ? assignmentDetails?.programs?.deletions.map((deletion) => {
                  return {
                    id: deletion?.id,
                    name: deletion?.name,
                  };
                })
              : [],
          additions:
            assignmentDetails?.programs?.additions?.length > 0
              ? assignmentDetails?.programs?.additions.map((addition) => {
                  return {
                    id: addition?.id,
                    name: addition?.name,
                  };
                })
              : [],
        },
        programUrl: `organisationUnits/${
          assignmentDetails?.organisationUnit?.id
        }/programs.json?cache=${assignmentDetails?.ticketNumber.replace(
          'DS',
          ''
        )}`,
        url: `organisationUnits/${
          assignmentDetails?.organisationUnit?.id
        }/dataSets.json?cache=${assignmentDetails?.ticketNumber.replace(
          'DS',
          ''
        )}`,
      }
    : null;
}

export function formulateFormAttributeMessage(
  dataSetAttributesDataInfo: any[],
  dataSet: any,
  keywordsKeys: any
): string {
  const dataSetAttributesData =
    dataSetAttributesDataInfo?.filter(
      (attrInfo) => attrInfo?.dataSet?.id === dataSet?.id
    ) || [];
  if (dataSetAttributesData?.length > 0) {
    const additions = dataSetAttributesData
      ?.map((attributeDataInfo) => {
        if (attributeDataInfo?.additions?.length > 0) {
          return attributeDataInfo?.categoryOption;
        }
      })
      ?.filter((addition) => addition);

    const deletions = dataSetAttributesData
      ?.map((attributeDataInfo) => {
        if (attributeDataInfo?.deletions?.length > 0) {
          return attributeDataInfo?.categoryOption;
        }
      })
      ?.filter((deletion) => deletion);
    return (
      (additions?.length > 0
        ? (keywordsKeys && keywordsKeys['Add'] ? keywordsKeys['Add'] : 'Add') +
          ': ' +
          additions?.map((addition) => addition?.name).join(',')
        : '') +
      (deletions?.length > 0
        ? ' ' +
          (keywordsKeys && keywordsKeys['Remove']
            ? keywordsKeys['Remove']
            : 'Remove') +
          ': ' +
          deletions?.map((deletion) => deletion?.name).join(',')
        : '')
    );
  } else {
    return null;
  }
}
