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

import React, { PureComponent } from 'react';
import { InputNumber, Select, Icon } from 'app/nusi';
import i18n from 'i18n';
import './variable-input-group.scss';
import { map, cloneDeep } from 'lodash';

const { Option } = Select;

interface IVariableInputGroupProps {
  value: Array<{
    protocol: string,
    port: number,
  }>;
  placeholder?: string;
  required?: boolean;
  label: string;
  onChange: (options: any[]) => void;
  disabled: boolean;
}


export default class extends PureComponent<IVariableInputGroupProps, any> {
  public state = {
    value: [],
  };

  static getDerivedStateFromProps(nextProps: any) {
    return {
      value: nextProps.value || [],
    };
  }

  public triggerChange = (changedValue: any) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(changedValue);
    }
  };

  public render() {
    const { value } = this.state;
    const { disabled } = this.props;

    const content = map(value, (item: any, index: number) => {
      return (
        <div key={index} className="flex-group">
          <Select
            style={{ width: '130px' }}
            value={item.protocol}
            disabled={disabled}
            placeholder={i18n.t('application:please select the protocol')}
            onChange={(v: any) => this.changeValue(index, 'protocol', v)}
          >
            <Option value="TCP">TCP</Option>
            <Option value="UDP">UDP</Option>
          </Select>
          <InputNumber
            disabled={disabled}
            style={{ width: '130px' }}
            placeholder={i18n.t('application:please enter the listening port')}
            className="ml8"
            value={item.port}
            onChange={(v: any) => this.changeValue(index, 'port', v)}
          />
          {disabled ? null : <Icon type="delete" className="variable-icon ml12" onClick={() => this.deleteVariable(index)} />}
        </div>
      );
    });

    return (
      <div>
        <div className='edit-service-label'>
          {i18n.t('application:ports')}
          {disabled ? null : <Icon className="variable-icon" type="plus" onClick={this.addNew} />}
        </div>
        {content}
      </div>
    );
  }

  private changeValue = (index: number, key: string, v: string | number) => {
    const { value } = this.state;
    const copy = cloneDeep(value);
    copy[index][key] = v;
    this.setState({
      value: copy,
    });
    this.triggerChange(copy);
  };

  private deleteVariable = (index: number) => {
    const { value } = this.state;
    value.splice(index, 1);
    this.setState({
      value,
    });
    this.triggerChange(value);
  };

  private addNew = () => {
    const { value } = this.state;
    const copy = [...value, { protocol: undefined, port: undefined }];
    this.setState({
      value: copy,
    });
    this.triggerChange(copy);
  };
}
