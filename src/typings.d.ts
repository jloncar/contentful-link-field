import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';

interface IAppProps {
  sdk: FieldExtensionSDK;
}

interface IAppState {
  links: any[];
}

interface ILink {
  type: 'internal' | 'external';
  label: string;
  url: string;
}
interface ILinkListItemProps {
  idx: number;
  item: ILink;
  sdk: FieldExtensionSDK;
  allowDrag?: boolean;
  linkableTypes: string[]; // which content types can be linked (need slug field)
  onEdit: (oldLink: ILink, newLink: ILink) => void;
  onDelete: (item: ILink) => void;
}

interface ILinkListProps {
  sdk: FieldExtensionSDK;
  min: number;
  max: number;
  items: ILink[];
  linkableTypes: string[]; // which content types can be linked (need slug field)
  onChange: Function; // Set state
}

interface IAddLinkProps {
  sdk: FieldExtensionSDK;
  linkableTypes: string[]; // which content types can be linked (need slug field)
  onAdd: Function; // Set state
}
