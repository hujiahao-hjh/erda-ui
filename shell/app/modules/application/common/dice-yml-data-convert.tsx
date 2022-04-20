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

import React from 'react';
import EditGlobalVariable from 'application/common/components/edit-global-variable';

import PropertyView from 'application/common/components/property-view';
import { EditService, ServiceView } from 'application/common/components/dice-service-node';
import { EditJob, JobView } from 'application/common/components/dice-job-node';
import { IDiceYamlEditorItem } from 'application/common/components/dice-yaml-editor-item';
import dependsOnDataFilter from 'application/common/depends-on-data-filter';
import { forEach } from 'lodash';
import i18n from 'i18n';

const getItemFromYamlJson = (key: string, jsonContent: any) => {
  let currentItem = {};
  if (key.includes('|')) {
    const splits = key.split('|');
    splits.forEach((splitKey: string) => {
      // @ts-ignore
      if (jsonContent[splitKey]) {
        // @ts-ignore
        currentItem = jsonContent[splitKey];
      }
    });
  } else {
    // @ts-ignore
    currentItem = jsonContent[key];
  }
  return currentItem;
};

interface IProps {
  jsonContent: any;
  editGlobalVariable: (globalVariable: any) => void;
  editService: (service: any) => void;
  editJob: (job: Obj) => void;
}

const convertByDiceYml = ({ jsonContent, editGlobalVariable, editService, editJob }: IProps) => {
  const result: Obj[] = [];
  const addons: Obj[] = [];
  const order = ['envs', 'services', 'jobs', 'addons'];

  if (jsonContent) {
    forEach(order, (key: string, index: number) => {
      const currentItem: any = getItemFromYamlJson(key, jsonContent);
      let item: IDiceYamlEditorItem | IDiceYamlEditorItem[];
      if (index === 0) {
        item = {
          id: -1,
          name: '',
          icon: 'qj',
          title: i18n.t('dop:deploy global variables'),
          lineTo: ['all'],
          data: currentItem,
          allowMove: false,
          allowDelete: false,
          content: () => {
            return <PropertyView dataSource={currentItem} />;
          },
          editView: (editing: boolean) => {
            return <EditGlobalVariable editing={editing} globalVariable={currentItem} onSubmit={editGlobalVariable} />;
          },
        };
        result.push([item]);
      } else if (index === 1) {
        const groups: any[] = dependsOnDataFilter(currentItem);
        groups.forEach((services: any[]) => {
          const group: any[] = [];
          services.forEach((service: any) => {
            // @ts-ignore
            group.push({
              icon: 'wfw',
              title: i18n.t('Microservice'),
              nodeType: 'service',
              data: currentItem,
              name: service.name,
              lineTo: service.depends_on,
              editView: (editing: boolean) => {
                return (
                  <EditService jsonContent={jsonContent} editing={editing} service={service} onSubmit={editService} />
                );
              },
              content: () => {
                return <ServiceView dataSource={service} />;
              },
            });
          });

          result.push(group);
        });
      } else if (index === 2 && result.length === 1) {
        const jobs: Obj[] = [];
        forEach(currentItem, (value: any, k: string) => {
          const job = {
            id: `job-${k}`,
            icon: 'wfw',
            title: i18n.t('dop:Job'),
            nodeType: 'job',
            name: k,
            data: { ...value, name: k },
          };
          jobs.push({
            ...job,
            editView: (editing: boolean) => {
              return <EditJob jsonContent={jsonContent} editing={editing} job={job} onSubmit={editJob} />;
            },
            content: () => {
              return <JobView dataSource={job} />;
            },
          });
        });

        jobs.length && result.push(jobs);
      } else if (index === 3) {
        forEach(currentItem, (value: any, k: string) => {
          const addon = { ...value, name: k };
          addons.push({
            id: `addon-${k}`,
            icon: 'addon1',
            data: addon,
            name: k,
            lineTo: [],
          });
        });
      }
    });
  } else {
    result.push([
      {
        icon: 'qj',
        title: i18n.t('dop:deploy global variables'),
        lineTo: [],
        allowMove: false,
        content: () => {
          return null;
        },
        editView: () => <div>{i18n.t('dop:edit deployment global variables')}</div>,
      },
    ]);
  }
  return {
    addons,
    editorData: result,
  };
};

export default convertByDiceYml;
