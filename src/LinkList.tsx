import * as React from 'react';
import {
  EntityList
} from '@contentful/forma-36-react-components';
import LinkListItem from './LinkListItem';
import { ILinkListProps, ILink } from './typings';
import { useEffect } from 'react';
import AddLink from './AddLink';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';

const LinkList: React.FunctionComponent<ILinkListProps> = ({
  sdk,
  items,
  min,
  max,
  linkableTypes,
  onChange
}) => {
  useEffect(() => {
    if (min > 0 && items.length === 0) {
      sdk.field.setInvalid(true);
    } else {
      sdk.field.setInvalid(false);
    }
  }, [items]);

  const onAdd = (link: ILink) => {
    const newState = [...items];
    newState.push(link);
    onChange(newState);
  };

  const onEdit = (oldLink: ILink, newLink: ILink) => {
    const idx = items.indexOf(oldLink);
    if (idx === -1) {
      console.error('Unable to find link', oldLink);
      return;
    }
    onChange([...items.slice(0, idx), newLink, ...items.slice(idx + 1)]);
  };

  const onDelete = (link: ILink) => {
    const idx = items.indexOf(link);
    if (idx === -1) {
      console.error('Unable to find link', link);
      return;
    }
    onChange([...items.slice(0, idx), ...items.slice(idx + 1)]);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index)
      return;

    const newState = Array.from(items)
    const tmp = newState[source.index]
    newState[source.index] = newState[destination.index]
    newState[destination.index] = tmp


    onChange([...newState])
  };

  const renderMain = () => {
    return (
      <div style={{ marginTop: '2rem' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={sdk.field.id}>
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <EntityList>
                  {items.map((i, n) => (
                    <LinkListItem
                      idx={n}
                      key={n}
                      sdk={sdk}
                      item={i}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      linkableTypes={linkableTypes}
                      allowDrag={items.length > 1}
                    />
                  ))}
                  {provided.placeholder}
                </EntityList>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
  };

  return (
    <>
      {items && items.length > 0 && renderMain()}

      <div style={{ marginTop: '2rem', paddingBottom: '4rem' }}>
        {items.length < max && <AddLink sdk={sdk} linkableTypes={linkableTypes} onAdd={onAdd} />}
      </div>
    </>
  );
};

export default LinkList;
