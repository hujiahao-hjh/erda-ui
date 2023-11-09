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

import iterationStore from 'app/modules/project/stores/iteration';
import { cloneDeep } from 'lodash';
import { FormModal } from 'common';
import { useUpdate } from 'common/use-hooks';
import i18n from 'i18n';
import moment, { Moment } from 'moment';
import { DatePicker, FormInstance } from 'antd';
import React from 'react';
import { TimeInput, checkReg, checkMsg, transToStr } from 'project/common/components/issue/time-input';

interface IProps {
  visible: boolean;
  data: ITERATION.Detail | null;
  onClose: (isSave: boolean) => void;
}
export default ({ visible, data, onClose }: IProps) => {
  const { createIteration, editIteration } = iterationStore.effects;
  const [state, updater] = useUpdate({
    detail: null,
  });

  React.useEffect(() => {
    if (visible) {
      if (data) {
        const { startedAt, finishedAt, ...rest } = data;
        updater.detail({
          timeRange: [moment(startedAt), moment(finishedAt)],
          ...rest,
        });
      } else {
        updater.detail(null);
      }
    }
  }, [data, updater, visible]);

  const fieldsList = [
    {
      name: 'title',
      label: i18n.t('Name'),
      itemProps: {
        maxLength: 255,
      },
    },
    {
      name: 'timeRange',
      label: i18n.t('Time'),
      required: true,
      getComp: ({ form }: { form: FormInstance }) => {
        return (
          <DatePicker.RangePicker
            borderTime
            format="YYYY-MM-DD"
            onOk={(value) => {
              form.setFieldsValue({ timeRange: value });
            }}
          />
        );
      },
    },
    {
      className: 'mb-3',
      name: ['manHour', 'estimateTime'],
      label: i18n.t('dop:work hours'),
      required: true,
      rules: [
        {
          validator: (_rule: any, value: number, callback: (msg?: string) => void) => {
            if (value && !checkReg.test(`${transToStr(value)} `)) {
              callback(checkMsg);
            }

            if (value === 0) {
              callback(`${i18n.t('Please enter')}${i18n.t('dop:work hours')}`);
            }

            callback();
          },
        },
      ],
      type: 'custom',
      getComp: () => <TimeInput changeOnInput />,
    },
    {
      name: 'content',
      label: i18n.t('dop:Goal'),
      type: 'textArea',
      required: false,
      itemProps: {
        maxLength: 4000,
        autoSize: {
          minRows: 8,
          maxRows: 8,
        },
      },
    },
  ];

  const handleSubmit = ({ timeRange, ...rest }: { title: string; content: string; timeRange: Moment[] }) => {
    if (state.detail) {
      editIteration({
        id: state.detail.id,
        startedAt: moment(timeRange[0]).format(),
        finishedAt: moment(timeRange[1]).format(),
        ...rest,
        state: state.detail.state,
      }).then(() => onClose(true));
    } else {
      createIteration({
        startedAt: moment(timeRange[0]).format(),
        finishedAt: moment(timeRange[1]).format(),
        ...rest,
      }).then(() => onClose(true));
    }
  };

  return (
    <FormModal
      name={i18n.t('dop:iteration')}
      visible={visible}
      fieldsList={fieldsList}
      formData={cloneDeep(state.detail)}
      onOk={handleSubmit}
      onCancel={() => onClose(false)}
    />
  );
};
