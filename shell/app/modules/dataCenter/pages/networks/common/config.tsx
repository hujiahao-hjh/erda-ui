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

import * as React from 'react';
import { Alert, Tooltip } from 'app/nusi';
import { Icon as CustomIcon } from 'common';
import i18n from 'i18n';

export const cloudVendor = {
  aliyun: { name: i18n.t('alibaba cloud'), value: 'aliyun' },
};

export const formConfig = {
  options: {
    CIDRType: [{ value: 'default', name: i18n.t('dataCenter:default CIDR Block') }, { value: 'custom', name: i18n.t('dataCenter:custom CIDR Block') }],
    defaultCIDR: ['192.168.0.0/16', '172.16.0.0/12', '10.0.0.0/8'],
  },
  extra: {
    CIDR: {
      default: <Alert message={i18n.t('dataCenter:the CIDR block cannot be modified after it is set')} type="warning" showIcon />,
      custom: <Alert message={`${i18n.t('dataCenter:the CIDR block cannot be modified after it is set')}${i18n.t('dataCenter:CIDR-tips')}`} type="warning" showIcon />,
    },
  },
  rule: {
    name: {
      pattern: /^[a-zA-Z\u4e00-\u9fa5][a-zA-Z\u4e00-\u9fa50-9-_]{1,127}$/,
      message: i18n.t('dataCenter:vpc-name-tip'),
    },
    description: {
      pattern: /^(?!http([s]?):\/\/).{2,256}/,
      message: i18n.t('dataCenter:CIDR-desc-tip'),
    },
  },
  label: {
    Zone: (
      <div className="label-with-required">
        {i18n.t('dcos:available area')}
        &nbsp;&nbsp;
        <Tooltip title={i18n.t('dataCenter:region-zone-vpc-tip')}>
          <CustomIcon type="help" />
        </Tooltip>
      </div>
    ),
  },
};
