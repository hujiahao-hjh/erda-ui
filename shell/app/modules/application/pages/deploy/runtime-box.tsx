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
import { Icon as CustomIcon, DeleteConfirm, Avatar, IF, MenuPopover } from 'common';
import { cutStr, goTo, fromNow } from 'common/utils';
import { Spin, Tooltip, Alert } from 'app/nusi';
import HealthPoint from 'project/common/components/health-point';
import routeInfoStore from 'common/stores/route';
import appStore from 'application/stores/application';
import i18n, { isZh } from 'i18n';
import { find, get } from 'lodash';
import { WithAuth, usePerm } from 'app/user/common';
import { approvalStatusMap } from 'application/pages/deploy-list/deploy-list';
import './runtime-box.scss';

const envMap = {
  DEV: i18n.t('develop'),
  TEST: i18n.t('test'),
  STAGING: i18n.t('staging'),
  PROD: i18n.t('prod'),
};

interface IProps {
  id: number;
  name: string;
  env: string;
  releaseId: string;
  status: string;
  deleteStatus: string;
  lastOperatorName: string;
  lastOperatorAvatar: string;
  lastOperateTime: string;
  deployStatus: string;
  canDeploy: boolean;
  onDelete(runtimeId: string): void;
  onRestart(runtimeId: string): void;
  onUpdate(): void;
}

const RuntimeBox = (props: IProps) => {
  const permMap = usePerm(s => s.app.runtime);
  const branchInfo = appStore.getState(s => s.branchInfo);
  const params = routeInfoStore.getState(s => s.params);
  const branchAuthObj = usePerm(s => s.app.pipeline);
  const popoverComp = (
    isDeploying: boolean,
    id: number,
    onDelete: Function,
    onRestart: Function,
    env: string,
    branch: string
  ) => (setVisible: Function) => {
    const updateAuth = get(find(branchInfo, { name: branch }), 'isProtect') ? branchAuthObj.executeProtected.pass : branchAuthObj.executeNormal.pass;
    return (
      <div>
        <WithAuth pass={updateAuth} >
          <span
            className="popover-item"
            onClick={(e) => {
              e.stopPropagation();
              props.onUpdate();
              setVisible(false);
            }}
          >
            {i18n.t('update')}
          </span>
        </WithAuth>
        <DeleteConfirm
          onConfirm={() => {
            onDelete(id.toString());
            setVisible(false);
          }}
          onShow={() => { setVisible(false); }}
          countDown={3}
          secondTitle={
            <span>
              {i18n.t('application:confirm to delete Runtime')}: <b>{isZh() ? `${envMap[env.toUpperCase()]} 环境的 【${branch}】` : `【${branch}】 in ${env}`}</b>
            </span>
          }
        >
          <WithAuth pass={permMap[`${env}Delete`]} disableMode={false}>
            <span className="popover-item">{i18n.t('application:delete')}</span>
          </WithAuth>
        </DeleteConfirm>
        <WithAuth pass={permMap[`${env}DeployOperation`]} disableMode={false}>
          <span
            className={isDeploying ? 'popover-item disabled' : 'popover-item'}
            onClick={(e) => {
              e.stopPropagation();
              if (!isDeploying) {
                onRestart(id.toString());
              }
              setVisible(false);
            }}
          >{i18n.t('application:restart')}
          </span>
        </WithAuth>
      </div>
    );
  };
  const gotoRelease = (releaseId: string, e: any) => {
    e.stopPropagation();
    goTo(goTo.pages.release, { ...params, q: releaseId });
  };

  const gotoRuntime = (runtimeId: number, e: any) => {
    e.stopPropagation();
    goTo(goTo.pages.runtimeDetail, { ...params, runtimeId });
  };

  const { id, name, releaseId, status, deleteStatus, lastOperatorName, lastOperatorAvatar, lastOperateTime, deployStatus, onDelete, onRestart } = props;
  const isDeploying = ['DEPLOYING'].includes(deployStatus);
  const env = props.env.toLowerCase();
  const isWaitApprove = deployStatus.toLowerCase() === approvalStatusMap.WaitApprove.value.toLowerCase();
  return (
    <Spin spinning={deleteStatus === 'DELETING'} tip={i18n.t('application:deleting')}>
      <div className={`flex-box runtime-box ${isWaitApprove ? 'large' : ''}`} onClick={e => gotoRuntime(id, e)}>
        <div className="flex-box runtime-box-header">
          <div className="branch">
            <CustomIcon type="slbb" />
            <Tooltip title={name}>
              <span className="bold nowrap">{name}</span>
            </Tooltip>
          </div>
          <IF check={props.canDeploy && deleteStatus !== 'DELETING' && (permMap[(`${env}Delete`)].pass || permMap[`${env}DeployOperation`].pass)}>
            <MenuPopover content={popoverComp(isDeploying, id, onDelete, onRestart, env, name)} />
          </IF>
        </div>

        {releaseId
          ? (
            <div>
              <Tooltip title={i18n.t('application:view version information')}>
                <span className="text-link release-link" onClick={e => gotoRelease(releaseId, e)}>
                  <CustomIcon type="bb" />
                  <span>{cutStr(releaseId, 6, { suffix: '' })}</span>
                </span>
              </Tooltip>
            </div>
          )
          : null
        }
        <div className="flex-box runtime-box-body">
          <div className="flex-box">
            <Avatar name={lastOperatorName} url={lastOperatorAvatar} className="mr4" size={20} />
            {lastOperatorName || ''}
            <span className="deploy-time">
              {
                lastOperateTime
                  ? fromNow(lastOperateTime)
                  : ''
              }
            </span>
          </div>
          {['Healthy', 'OK'].includes(status) ? null : <HealthPoint type="runtime" status={status} />}
        </div>
        {
          isWaitApprove ? (
            <Alert message={i18n.t('application:project manager confirming')} type="normal" showIcon />
          ) : null
        }
      </div>
    </Spin>
  );
};

export default RuntimeBox;
