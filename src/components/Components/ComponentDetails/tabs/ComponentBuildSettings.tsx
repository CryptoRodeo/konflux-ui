import * as React from 'react';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import usePACState from '../../../../hooks/usePACState';
import { ComponentKind } from '../../../../types';
import ComponentPACStateLabel from '../../../CustomizedPipeline/ComponentPACStateLabel';
import ComponentBuildTrigger from '../../ComponentBuildTrigger';

type ComponentBuildSettingsProps = {
  component: ComponentKind;
};

const ComponentBuildSettings: React.FC<React.PropsWithChildren<ComponentBuildSettingsProps>> = ({
  component,
}) => {
  const pacState = usePACState(component);

  return (
    <>
      <Flex direction={{ default: 'row' }}>
        <FlexItem style={{ flex: 1 }}>
          <DescriptionList
            columnModifier={{
              default: '1Col',
            }}
          >
            <DescriptionListGroup>
              <DescriptionListTerm>Build pipeline plan</DescriptionListTerm>
              <DescriptionListDescription data-testid="edit-build-pipeline">
                <ComponentPACStateLabel component={component} enableAction />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </FlexItem>
        <FlexItem style={{ flex: 1 }}>
          <DescriptionList
            columnModifier={{
              default: '1Col',
            }}
          >
            <DescriptionListGroup>
              <DescriptionListTerm>Build trigger</DescriptionListTerm>
              <DescriptionListDescription>
                <ComponentBuildTrigger pacState={pacState} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </FlexItem>
      </Flex>
    </>
  );
};

export default React.memo(ComponentBuildSettings);
