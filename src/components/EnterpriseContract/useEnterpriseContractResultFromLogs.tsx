import * as React from 'react';
import { useTaskRuns } from '../../hooks/useTaskRuns';
import { commonFetchJSON } from '../../k8s';
import { getK8sResourceURL } from '../../k8s/k8s-utils';
import { PodModel } from '../../models/pod';
import { getTaskRunLog } from '../../utils/tekton-results';
import { useWorkspaceInfo } from '../Workspace/workspace-context';
import {
  ComponentEnterpriseContractResult,
  EnterpriseContractResult,
  ENTERPRISE_CONTRACT_STATUS,
  UIEnterpriseContractData,
} from './types';
import { extractEcResultsFromTaskRunLogs } from './utils';

export const useEnterpriseContractResultFromLogs = (
  pipelineRunName: string,
): [ComponentEnterpriseContractResult[], boolean] => {
  const { namespace, workspace } = useWorkspaceInfo();
  const [taskRun, loaded, error] = useTaskRuns(namespace, pipelineRunName, 'verify');
  const [fetchTknLogs, setFetchTknLogs] = React.useState<boolean>(false);
  const [ecJson, setEcJson] = React.useState<EnterpriseContractResult>();
  const [ecLoaded, setEcLoaded] = React.useState<boolean>(false);
  const ecResultOpts = React.useMemo(() => {
    const podName = loaded && !error ? taskRun[0].status.podName : null;
    return podName
      ? {
          ns: namespace,
          name: podName,
          path: 'log',
          queryParams: {
            container: 'step-report-json',
            follow: 'true',
          },
        }
      : null;
  }, [loaded, error, taskRun, namespace]);

  React.useEffect(() => {
    let unmount = false;
    if (ecResultOpts) {
      commonFetchJSON(getK8sResourceURL(PodModel, undefined, ecResultOpts))
        .then((res: EnterpriseContractResult) => {
          if (unmount) return;
          setEcJson(res);
          setEcLoaded(true);
        })
        .catch((err) => {
          if (unmount) return;
          if (err.code === 404) {
            setFetchTknLogs(true);
          } else {
            setEcLoaded(true);
          }
          // eslint-disable-next-line no-console
          console.warn('Error while fetching Enterprise Contract result from logs', err);
        });
    }
    return () => {
      unmount = true;
    };
  }, [ecResultOpts]);

  React.useEffect(() => {
    let unmount = false;
    if (fetchTknLogs) {
      const fetch = async () => {
        try {
          const logs = await getTaskRunLog(
            workspace,
            taskRun[0].metadata.namespace,
            taskRun[0].metadata.name,
          );
          if (unmount) return;
          const json = extractEcResultsFromTaskRunLogs(logs);
          setEcJson(json);
          setEcLoaded(true);
        } catch (e) {
          if (unmount) return;
          setEcLoaded(true);
          // eslint-disable-next-line no-console
          console.warn(
            'Error while fetching Enterprise Contract result from tekton results logs',
            e,
          );
        }
      };

      void fetch();
    }
    return () => {
      unmount = true;
    };
  }, [fetchTknLogs, taskRun, workspace]);

  const ecResult = React.useMemo(() => {
    // filter out components for which ec didn't execute because invalid image URL
    return ecLoaded && ecJson
      ? ecJson.components?.filter((comp: ComponentEnterpriseContractResult) => {
          return !(
            comp.violations &&
            comp.violations?.length === 1 &&
            !comp.violations[0].metadata &&
            comp.violations[0].msg.includes('404 Not Found')
          );
        })
      : undefined;
  }, [ecJson, ecLoaded]);

  return [ecResult, ecLoaded];
};

export const mapEnterpriseContractResultData = (
  ecResult: ComponentEnterpriseContractResult[],
): UIEnterpriseContractData[] => {
  return ecResult.reduce((acc, compResult) => {
    compResult?.violations?.forEach((v) => {
      const rule: UIEnterpriseContractData = {
        title: v.metadata?.title,
        description: v.metadata?.description,
        status: ENTERPRISE_CONTRACT_STATUS.violations,
        timestamp: v.metadata?.effective_on,
        component: compResult.name,
        msg: v.msg,
        collection: v.metadata?.collections,
        solution: v.metadata?.solution,
      };
      acc.push(rule);
    });
    compResult?.warnings?.forEach((v) => {
      const rule: UIEnterpriseContractData = {
        title: v.metadata?.title,
        description: v.metadata?.description,
        status: ENTERPRISE_CONTRACT_STATUS.warnings,
        timestamp: v.metadata?.effective_on,
        component: compResult.name,
        msg: v.msg,
        collection: v.metadata?.collections,
      };
      acc.push(rule);
    });
    compResult?.successes?.forEach((v) => {
      const rule: UIEnterpriseContractData = {
        title: v.metadata?.title,
        description: v.metadata?.description,
        status: ENTERPRISE_CONTRACT_STATUS.successes,
        component: compResult.name,
        collection: v.metadata?.collections,
      };
      acc.push(rule);
    });

    return acc;
  }, []);
};

export const useEnterpriseContractResults = (
  pipelineRunName: string,
): [UIEnterpriseContractData[], boolean] => {
  const [ec, ecLoaded] = useEnterpriseContractResultFromLogs(pipelineRunName);
  const ecResult = React.useMemo(() => {
    return ecLoaded && ec ? mapEnterpriseContractResultData(ec) : undefined;
  }, [ec, ecLoaded]);

  return [ecResult, ecLoaded];
};
