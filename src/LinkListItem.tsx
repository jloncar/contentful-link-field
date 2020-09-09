import * as React from 'react';
import {
  EntityListItem,
  CardDragHandle,
  DropdownList,
  DropdownListItem
} from '@contentful/forma-36-react-components';
import { ILinkListItemProps } from './typings';
import { Draggable } from 'react-beautiful-dnd';

const LinkListItem: React.FunctionComponent<ILinkListItemProps> = ({
  idx,
  item,
  linkableTypes,
  sdk,
  allowDrag,
  onEdit,
  onDelete
}) => {

  const changeLabel = async () => {
    
    const labelNew = await sdk.dialogs.openPrompt({
      title: 'Link Label',
      message: 'Please enter link text.',
      defaultValue: item.label || ''
    });

    if (!labelNew) return;

    onEdit(item, { label: (labelNew as string), url: item.url, type: item.type })
  }

  const changeLink = async () => {
    
    if(item.type === "external")
    {

      const labelNew = await sdk.dialogs.openPrompt({
        title: 'Link Label',
        message: 'Please enter link text.',
        defaultValue: item.label || ''
      });
      if (!labelNew) return;
      onEdit(item, { label: (labelNew as string), url: item.url, type: item.type })
      return;
    }

    // Internal
    const entity: any = await sdk.dialogs.selectSingleEntry({
      contentTypes: linkableTypes
    });

    if (!entity) return;

    onEdit(item, {
      type: item.type,
      url: entity.fields.slug[sdk.locales.default],
      label: item.label
    })

  }

  const deleteLink = async () => {
    const confirm = await sdk.dialogs.openConfirm({
      title: 'Are you sure?',
      message: 'Are you sure you want to remove this link?'
    });

    if (!confirm) return;

    onDelete(item)
  }

  const dropdown = (
    <DropdownList>
      <DropdownListItem
        isActive={false}
        isDisabled={false}
        isTitle={false}
        onClick={() => changeLabel()}>
        Change Label
      </DropdownListItem>
      <DropdownListItem
        isActive={false}
        isDisabled={false}
        isTitle={false}
        onClick={() => changeLink()}>
        Change Link
      </DropdownListItem>
      <DropdownListItem
        isActive={false}
        isDisabled={false}
        isTitle={false}
        onClick={() => deleteLink()}>
        Remove
      </DropdownListItem>
    </DropdownList>
  );

  return (
    <Draggable draggableId={`${idx}`} index={idx}>
      {provided => (
        <div {...provided.draggableProps} ref={provided.innerRef}>
          <EntityListItem
            cardDragHandleComponent={ allowDrag && (
              <CardDragHandle {...provided.dragHandleProps}>
                Reorder card
              </CardDragHandle>
            )}
            className=""
            contentType={item.type}
            title={item.label}
            description={item.url}
            dropdownListElements={dropdown}
            entityType="Entry"
          />
        </div>
      )}
    </Draggable>
  );
};

export default LinkListItem;
