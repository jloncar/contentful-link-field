import * as React from 'react';
import { TextLink } from '@contentful/forma-36-react-components';
import { IAddLinkProps } from './typings';
const AddLink: React.FunctionComponent<IAddLinkProps> = ({
  sdk,
  linkableTypes,
  allowAssets,
  onAdd
}) => {
  const addInternal = async () => {
    const entity: any = await sdk.dialogs.selectSingleEntry({
      contentTypes: linkableTypes
    });

    if (!entity) return;

    onAdd({
      type: 'internal',
      url: entity.fields.slug[sdk.locales.default],
      label: entity.fields.title[sdk.locales.default]
    });
  };

  const addAsset = async () => {
    const entity: any = await sdk.dialogs.selectSingleAsset();
    console.log(entity)

    if (!entity) return;

    onAdd({
      type: 'external',
      url: `https:${entity.fields.file[sdk.locales.default].url}`,
      label: entity.fields.title[sdk.locales.default]
    });
  };

  const addExternal = async () => {
    const url = await sdk.dialogs.openPrompt({
      title: 'External URL',
      message: 'Please enter full URL.',
      defaultValue: 'https://'
    });

    if (!url) return;

    onAdd({
      type: 'external',
      url: url,
      label: url
    });
  };

  return (
    <div>
      <TextLink icon="Link" onClick={addInternal}>
        Add Internal Link
      </TextLink>
      <span style={{ marginRight: '2rem' }}></span>
      <TextLink icon="ExternalLink" onClick={addExternal}>
        Add External Link
      </TextLink>
      {allowAssets && (
        <React.Fragment>
          <span style={{ marginRight: '2rem' }}></span>
          <TextLink icon="ExternalLink" onClick={addAsset}>
            Add Asset Link
          </TextLink>
        </React.Fragment>
      )}
    </div>
  );
};

export default AddLink;
