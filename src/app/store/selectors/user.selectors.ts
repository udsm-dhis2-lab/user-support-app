import { createSelector } from '@ngrx/store';
import { getRootState, State } from '../reducers';
import { UserState } from '../states/user.state';
import { User } from '@iapps/ngx-dhis2-http-client';
import { keyBy } from 'lodash';

export const getUserState = createSelector(
  getRootState,
  (state: State) => state.user
);

export const getCurrentUser = createSelector(
  getUserState,
  (state: UserState) => {
    return {
      ...state.currentUser,
      keyedAuthorities: keyBy(
        state.currentUser?.authorities?.map((authority) => {
          return {
            key: authority,
            value: authority,
          };
        }),
        'key'
      ),
      userGroupsKeyed: keyBy(state?.currentUser?.userGroups, 'id'),
    };
  }
);

export const getCurrentUserLoading = createSelector(
  getUserState,
  (state: UserState) => state.loading
);

export const getCurrentUserLoaded = createSelector(
  getUserState,
  (state: UserState) => state.loaded
);

export const getCurrentUserLoadingError = createSelector(
  getUserState,
  (state: UserState) => state.error
);

export const getCurrentUserManagementAuthoritiesStatus = createSelector(
  getCurrentUser,
  (currentUser: User) => {
    if (!currentUser) {
      return false;
    }

    return currentUser && currentUser.authorities
      ? currentUser.authorities.includes('ALL')
      : false;
  }
);
