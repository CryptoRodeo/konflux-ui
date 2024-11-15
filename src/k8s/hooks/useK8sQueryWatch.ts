import * as React from 'react';
import { useDeepCompareMemoize } from '../../shared';
import { K8sResourceBaseOptions } from '../k8s-fetch';
import { watchListResource, watchObjectResource } from '../watch-utils';
import { WebSocketOptions } from '../web-socket/types';

const WS = new Map();

export const useK8sQueryWatch = (
  resourceInit: K8sResourceBaseOptions,
  isList: boolean,
  hashedKey: string,
  options?: Partial<WebSocketOptions & RequestInit & { wsPrefix?: string; pathPrefix?: string }>,
) => {
  const deepResourceInit = useDeepCompareMemoize(resourceInit);
  const deepOptions = useDeepCompareMemoize(options);
  React.useEffect(() => {
    const startWatch = () => {
      if (deepResourceInit && !WS.has(hashedKey)) {
        const websocket = isList
          ? watchListResource(deepResourceInit, deepOptions)
          : watchObjectResource(deepResourceInit, deepOptions);
        WS.set(hashedKey, websocket);
      }
    };

    startWatch();
    return () => {
      if (deepResourceInit && WS.has(hashedKey)) {
        WS.get(hashedKey).destroy();
        WS.delete(hashedKey);
      }
    };
  }, [isList, hashedKey, deepOptions, deepResourceInit]);
};
