// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import React, { Component } from 'react';
import i18n from 'i18n';
import classnames from 'classnames';
import { Input, Upload } from 'app/nusi';
import { Icon as CustomIcon } from 'common';
import { get, isEqual, map } from 'lodash';
import { getUploadProps } from 'common/utils/upload-props';
import { WrappedFormUtils } from 'core/common/interface';


import './image-upload.scss';

interface IProps {
  value?: string;
  form?: WrappedFormUtils;
  id: string;
  /**
   * 是否开启多图模式，默认不开启
   *
   * @type {boolean}
   * @memberof IProps
   */
  isMulti?: boolean;
  /**
   * 是否长宽相等，默认相等
   *
   * @type {boolean}
   * @memberof IProps
   */
  isSquare?: boolean;
  uploadText?: string;
  hintText?: string;
  showHint?: boolean;
  queryData?: any;
  sizeLimit?: number;
  afterUpload?(url?: string | string[]): void;
}
interface IState {
  imageUrl?: string;
  images: string[],
  queryData?: any;
}
export class ImageUpload extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      imageUrl: props.isMulti ? undefined : props.value,
      images: props.isMulti ? (props.value as unknown as string[] || []) : [],
      queryData: props?.queryData,
    };
  }

  static getDerivedStateFromProps(nextProps: IProps, preState: IState): Partial<IState>| null{
    if (!isEqual(nextProps.value, preState.imageUrl)) {
      if (nextProps.isMulti) {
        return { images: nextProps.value as unknown as string[] };
      } else {
        return { imageUrl: nextProps.value };
      }
    }
    return null;
  }

  getUploadProps(qData: any) {
    const { form, id, sizeLimit = 1, afterUpload, isMulti } = this.props;
    const { images = [] } = this.state;
    return getUploadProps({
      queryData: qData,
      onChange: (info: any) => {
        const { response } = info.file;
        if (!response) {
          return;
        }
        const url = (get(response, 'data.url') || '').replace(/^http(s)?:/g, '');
        if (url) {
          if (isMulti) {
            this.setState({ images: [...images, url] });
          } else {
            this.setState({ imageUrl: url });
          }
          form && form.setFieldsValue({ [id]: isMulti ? [...images, url] : url });
          afterUpload && afterUpload(isMulti ? [...images, url] : url);
        }
      },
    }, sizeLimit);
  }

  renderPureUploadItem(uploadText: string, queryData: any) {
    return (
      <div className="image-upload mr8 mb8" key="upload">
        <Input type="hidden" />
        <Upload
          className="pure-upload"
          accept=".jpg, .jpeg, .png, .gif"
          {...this.getUploadProps(queryData)}
        >
          <div>
            <CustomIcon key="icon" type="cir-add" />
            <div key="text">{uploadText}</div>
          </div>
        </Upload>
      </div>
    );
  }

  renderWithImageUploadItem(imageUrl: string, uploadText: string, queryData: any) {
    const { isSquare = true } = this.props;
    return (
      <div className="image-upload mr8 mb8">
        <Input type="hidden" value={imageUrl} />
        <Upload accept=".jpg, .jpeg, .png, .gif" {...this.getUploadProps(queryData)}>
          <div>
            <img
              alt="upload"
              src={imageUrl}
              className={classnames({
                'image-content': true,
                'no-square': !isSquare,
              })}
            />
            <div className="no-image">
              <CustomIcon key="icon" type="cir-add" />
              <div key="text">{uploadText}</div>
            </div>
          </div>
        </Upload>
      </div>
    );
  }

  renderPureImageItem(imageUrl: string, idx?: number) {
    const { isSquare = true, form, afterUpload, id, isMulti } = this.props;
    const { images = [] } = this.state;

    return (
      <div className="image-upload mr8 mb8" key={imageUrl}>
        <img
          alt="upload"
          src={imageUrl}
          className={classnames({
            'image-content': true,
            'no-square': !isSquare,
          })}
        />
        <div
          className="remove-image"
          onClick={() => {
            if (isMulti) {
              const _images = [...images];
              _images.splice(idx as number, 1);
              this.setState({ images: _images });
              form && form.setFieldsValue({ [id]: _images });
              afterUpload && afterUpload(_images);
            } else {
              this.setState({ imageUrl: undefined });
              form && form.setFieldsValue({ [id]: undefined });
              afterUpload && afterUpload(undefined);
            }
          }}
        >
          <CustomIcon key="icon" type="shanchu" />
          <div key="text">{i18n.t('common:remove')}</div>
        </div>
      </div>
    );
  }

  renderUploadItem() {
    const { uploadText = i18n.t('upload image'), isMulti = false } = this.props;
    const { imageUrl, images, queryData } = this.state;

    return (
      isMulti
        ?
        [
          ...map(images, (url, idx) => this.renderPureImageItem(url, idx)),
          this.renderPureUploadItem(uploadText as string, queryData),
        ]
        :
        imageUrl
          ? this.renderPureImageItem(imageUrl as string)
          : this.renderPureUploadItem(uploadText as string, queryData)
    );
  }

  render() {
    const { hintText, sizeLimit = 1, showHint } = this.props;
    const _hintText = hintText || i18n.t('upload-image-limit {sizeLimit}', { sizeLimit });

    return (
      <div className='image-upload-wrap'>
        <div className="wrap-flex-box">
          {this.renderUploadItem()}
        </div>
        {showHint ? <div className="hint">{_hintText}</div> : null}
      </div>
    );
  }
}
