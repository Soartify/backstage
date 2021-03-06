/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ApiRef,
  OAuthApi,
  SessionStateApi,
  useApi,
  Subscription,
  IconComponent,
  SessionState,
} from '@backstage/core-api';
import React, { FC, useState, useEffect } from 'react';
import { ProviderSettingsItem } from './ProviderSettingsItem';

type OAuthProviderSidebarProps = {
  title: string;
  icon: IconComponent;
  apiRef: ApiRef<OAuthApi & SessionStateApi>;
};

export const OAuthProviderSettings: FC<OAuthProviderSidebarProps> = ({
  title,
  icon,
  apiRef,
}) => {
  const api = useApi(apiRef);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let didCancel = false;

    const checkSession = async () => {
      const session = await api.getAccessToken('', { optional: true });
      if (!didCancel) {
        setSignedIn(!!session);
      }
    };
    let subscription: Subscription;
    const observeSession = () => {
      subscription = api
        .sessionState$()
        .subscribe((sessionState: SessionState) => {
          if (!didCancel) {
            setSignedIn(sessionState === SessionState.SignedIn);
          }
        });
    };

    checkSession();
    observeSession();
    return () => {
      didCancel = true;
      subscription.unsubscribe();
    };
  }, [api]);

  return (
    <ProviderSettingsItem
      title={title}
      icon={icon}
      signedIn={signedIn}
      api={api}
      signInHandler={() => api.getAccessToken()}
    />
  );
};
