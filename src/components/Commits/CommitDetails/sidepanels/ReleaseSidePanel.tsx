import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
} from '@patternfly/react-core';
import { ElementModel, GraphElement } from '@patternfly/react-topology';
import PipelineIcon from '../../../../assets/pipelineIcon.svg';
import { RELEASE_DESC } from '../../../../utils/pipeline-utils';
import { StatusIconWithTextLabel } from '../../../topology/StatusIcon';
import { useWorkspaceInfo } from '../../../Workspace/useWorkspaceInfo';
import { CommitWorkflowNodeModelData } from '../visualization/commit-visualization-types';

export interface ReleaseSidePanelBodyProps {
  onClose: () => void;
  workflowNode: GraphElement<ElementModel, CommitWorkflowNodeModelData>;
}

const ReleaseSidePanel: React.FC<React.PropsWithChildren<ReleaseSidePanelBodyProps>> = ({
  workflowNode,
  onClose,
}) => {
  const { workspace } = useWorkspaceInfo();
  const workflowData = workflowNode.getData();
  const release = workflowData.resource;

  return (
    <>
      <div className="commit-side-panel__head">
        <DrawerHead data-test="release-side-panel-head">
          <span className="commit-side-panel__head-title">
            {release ? workflowNode.getLabel() : 'Release'}
            {release ? <StatusIconWithTextLabel status={workflowNode.getData().status} /> : null}
          </span>
          <span className="pf-v5-u-mt-xs commit-side-panel__subtext">
            <img src={PipelineIcon} alt="pipeline run" /> Release
          </span>
          <DrawerActions>
            <DrawerCloseButton onClick={onClose} />
          </DrawerActions>
        </DrawerHead>
        <DrawerPanelBody data-test="release-side-panel-body">
          <DescriptionList
            data-test="pipeline-run-details"
            columnModifier={{
              default: '1Col',
            }}
          >
            <DescriptionListGroup>
              {!release ? <DescriptionListTerm>No releases set</DescriptionListTerm> : null}
              <DescriptionListDescription>{RELEASE_DESC}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListDescription>
                <Link
                  to={`/workspaces/${workspace}/applications/${workflowData.application}/activity/pipelineruns`}
                >
                  View pipeline runs
                </Link>
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </DrawerPanelBody>
      </div>
    </>
  );
};

export default ReleaseSidePanel;
