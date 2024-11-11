import * as React from 'react';
import {
  Badge,
  Divider,
  Menu,
  MenuContainer,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuList,
  MenuToggle,
} from '@patternfly/react-core';
import { useField } from 'formik';
import { flatten } from 'lodash-es';

type SelectComponentsDropdownProps = {
  children: React.ReactNode | React.ReactNode[];
  toggleText: string;
  onSelect: (item: string | number) => void;
  closeOnSelect?: boolean;
  badgeValue?: number;
};

const SelectComponentsDropdown: React.FC<SelectComponentsDropdownProps> = ({
  children,
  toggleText,
  onSelect,
  closeOnSelect,
  badgeValue,
}) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  return (
    <MenuContainer
      isOpen={isOpen}
      onOpenChange={(o) => setIsOpen(o)}
      toggle={
        <MenuToggle
          ref={toggleRef}
          isExpanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          id="toggle-component-menu"
          aria-label="toggle component menu"
          badge={badgeValue ? <Badge isRead>{badgeValue}</Badge> : null}
          isFullWidth
        >
          {toggleText}
        </MenuToggle>
      }
      menu={
        <Menu
          ref={menuRef}
          id="multi-select-component-menu"
          isScrollable
          onSelect={(_, item) => {
            onSelect(item);
            closeOnSelect && setIsOpen(false);
          }}
        >
          <MenuContent>{children}</MenuContent>
        </Menu>
      }
      toggleRef={toggleRef}
      menuRef={menuRef}
    />
  );
};

type MultiSelectComponentsDropdownProps = {
  groupedComponents: { [application: string]: string[] };
  sourceComponentName?: string;
  name: string;
};

export const MultiSelectComponentsDropdown: React.FC<MultiSelectComponentsDropdownProps> = ({
  sourceComponentName,
  groupedComponents,
  name,
}) => {
  const [{ value: selectedComponents }, , { setValue }] = useField<string[]>(name);
  const componentNames = flatten(Object.values(groupedComponents));
  const [selectAll, setSelectAll] = React.useState<boolean>(
    componentNames.length - 1 === selectedComponents.length,
  );
  const handleSelect = React.useCallback(
    (item: string) => {
      if (item === 'select-all') {
        if (selectAll) {
          void setValue([]);
          setSelectAll(false);
        } else {
          const selected = componentNames.filter((v) => v !== sourceComponentName);
          void setValue(selected);
          setSelectAll(true);
        }
      } else {
        if (selectedComponents.includes(item)) {
          const selectedItems = selectedComponents.filter((v) => v !== item);
          void setValue(selectedItems);
        } else {
          void setValue([...selectedComponents, item]);
        }
      }
    },
    [componentNames, selectAll, setValue, sourceComponentName, selectedComponents],
  );

  return (
    <SelectComponentsDropdown
      toggleText="Choose components to nudge"
      onSelect={handleSelect}
      badgeValue={selectedComponents.length || null}
    >
      <MenuGroup>
        <MenuList>
          <MenuItem hasCheckbox itemId="select-all" isSelected={selectAll}>
            Select all
          </MenuItem>
        </MenuList>
      </MenuGroup>
      <Divider component="li" />
      {Object.entries(groupedComponents).map(([application, components]) => (
        <MenuGroup key={application} label={application}>
          <MenuList>
            {components.map((component) => {
              const isSelected = selectedComponents.includes(component);
              const isDisabled = component === sourceComponentName;
              return (
                <MenuItem
                  key={component}
                  hasCheckbox
                  itemId={component}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  tooltipProps={
                    isDisabled
                      ? {
                          trigger: 'mouseenter',
                          content: 'This component is already in the relationship.',
                          zIndex: 1000,
                        }
                      : undefined
                  }
                >
                  {component}
                </MenuItem>
              );
            })}
          </MenuList>
        </MenuGroup>
      ))}
    </SelectComponentsDropdown>
  );
};

type SingleSelectComponentDropdownProps = {
  componentNames: string[];
  name: string;
  disableMenuItem?: (item: string) => boolean;
};

export const SingleSelectComponentDropdown: React.FC<SingleSelectComponentDropdownProps> = ({
  componentNames,
  name,
  disableMenuItem,
}) => {
  const [{ value }, , { setValue }] = useField<string>(name);
  const handleSelect = React.useCallback(
    (item: string) => {
      void setValue(item);
    },
    [setValue],
  );
  return (
    <SelectComponentsDropdown
      toggleText={value || 'Select a component'}
      onSelect={handleSelect}
      closeOnSelect
    >
      <MenuList>
        {componentNames.map((component) => (
          <MenuItem
            key={component}
            itemId={component}
            selected={value === component}
            isDisabled={disableMenuItem?.(component)}
            tooltipProps={
              disableMenuItem?.(component)
                ? {
                    appendTo: () => document.querySelector('#hacDev-modal-container'),
                    content: 'This component is already in the relationship.',
                  }
                : undefined
            }
          >
            {component}
          </MenuItem>
        ))}
      </MenuList>
    </SelectComponentsDropdown>
  );
};
