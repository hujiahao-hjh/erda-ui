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

import i18n from 'i18n';

const tabs = [
  { key: 'affairs', name: i18n.t('microService:external affairs') },
];

const getEIRouter = () => ({
  path: 'ei/:hostName',
  mark: 'externalInsight',
  breadcrumbName: ({ params }) => decodeURIComponent(params.hostName || ''),
  routes: [
    {
      path: 'affairs',
      tabs,
      getComp: cb => cb(import('microService/monitor/external-insight/pages/affairs/affairs')),
    },
  ],
});

export default getEIRouter;
