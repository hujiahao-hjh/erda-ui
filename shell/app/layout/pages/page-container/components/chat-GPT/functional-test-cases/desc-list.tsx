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

import React, { useEffect, useState } from 'react';
import i18n from 'i18n';
import { Button, Divider, message } from 'antd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ErdaIcon, MarkdownEditor } from 'common';
import ContentPanel from 'project/pages/test-manage/case/case-drawer/content-panel';
import CaseStep from 'project/pages/test-manage/case/case-drawer/case-step';
import projectStore from 'project/stores/project';
import userStore from 'app/user/stores';
import { getAddonList, Case, IRow } from 'layout/services/ai-test';

import 'project/pages/test-manage/case/case-drawer/index.scss';

const DescList = ({ rows: _rows }: { rows: IRow[] }) => {
  const { id: projectID, name: projectName } = projectStore.useStore((s) => s.info);
  const { id: userId } = userStore.getState((s) => s.loginUser);
  const [cases, setCases] = useState<Case[]>([]);
  const [rows, setRows] = useState<IRow[]>([]);

  useEffect(() => {
    setRows(
      _rows.map((item) => ({
        id: item.id,
        title: item.title,
        content: rows.find((row) => row.id === item.id)?.content || item.content,
      })),
    );
  }, [_rows]);

  const getTestCase = async (items: IRow[]) => {
    const res = await getAddonList({
      userId,
      projectID,
      projectName,
      requirements: items.map((item) => ({ issueID: item.id, prompt: `${item.title},${item.content}` })),
    });

    if (res.success) {
      setCases(res.data || []);
    }
  };

  const apply = async () => {
    const error = cases.map((item) => doCheck(item)).find((item) => item);

    if (error) {
      message.error(error);
      return false;
    }

    const requirements = cases.map((item, index) => ({
      issueID: item.requirementID,
      prompt: `${rows[index]?.title},${rows[index]?.content}`,
      testCaseCreateReq: item.testCaseCreateReq,
    }));
    const param = {
      userId,
      projectID,
      projectName,
      requirements,
      needAdjust: false,
    };
    const res = await getAddonList(param);

    if (res.success) {
      message.success(i18n.t('{action} successfully', { action: i18n.t('apply') }));
    }
  };

  const renderItem = (item: Obj, index: number) => {
    return (
      <div className="bg-white rounded-[4px] p-2 mb-4">
        <div className="flex-h-center">
          <div className="flex items-start flex-1">
            <ErdaIcon type="xuqiu" className="text-xl mr-1 relative top-0.5" />
            {item.title}
          </div>
        </div>
        <Divider />
        <div className="my-2">
          <MarkdownEditor
            value={item.content}
            className="markdown-border-none"
            onChange={(val) => {
              rows[index].content = val;
              setRows([...rows]);
            }}
          />
        </div>
        {(cases.length && (
          <>
            <Divider />
            <div className="flex-h-center">
              <ErdaIcon type="quexian" className="text-xl mr-1" />
              <div className="flex-1">{i18n.t('test case preview')}</div>
              <Button>{i18n.t('apply')}</Button>
            </div>
            <Divider />
            <div>
              <ContentPanel title={i18n.t('dop:Preconditions')}>
                <MarkdownEditor
                  value={cases[index]?.testCaseCreateReq?.preCondition}
                  onBlur={(v: string) => {
                    if (cases[index]) {
                      cases[index].testCaseCreateReq.preCondition = v;
                      setCases([...cases]);
                    }
                  }}
                  placeholder={i18n.t('dop:No content')}
                />
              </ContentPanel>
              <ContentPanel
                title={i18n.t('dop:Steps and results')}
                mode="add"
                onClick={() => {
                  if (cases[index]) {
                    cases[index].testCaseCreateReq.stepAndResults = [
                      ...cases[index].testCaseCreateReq.stepAndResults,
                      { step: '', result: '' },
                    ];
                    setCases([...cases]);
                  }
                }}
              >
                <CaseStep
                  value={cases[index]?.testCaseCreateReq?.stepAndResults}
                  onChange={(stepsData) => {
                    if (cases[index]) {
                      cases[index].testCaseCreateReq.stepAndResults = stepsData;
                      setCases([...cases]);
                    }
                  }}
                />
              </ContentPanel>
              <ContentPanel title={i18n.t('Description')}>
                <MarkdownEditor
                  value={cases[index]?.testCaseCreateReq?.desc}
                  onBlur={(v: string) => {
                    if (cases[index]) {
                      cases[index].testCaseCreateReq.desc = v;
                      setCases([...cases]);
                    }
                  }}
                  placeholder={i18n.t('dop:Additional description')}
                />
              </ContentPanel>
            </div>
          </>
        )) ||
          ''}
      </div>
    );
  };

  return (
    <div className="p-4 flex flex-col h-full overflow-auto case-drawer-body">
      <DndProvider backend={HTML5Backend}>
        <div className="flex-h-center flex-none">
          <div className="flex-1 font-medium test-base">{i18n.t('default:test case description and preview')}</div>
          <div className="flex-none">
            <Button className="mr-1" onClick={() => apply()}>
              {i18n.t('default:batch apply')}
            </Button>
            <Button onClick={() => getTestCase(rows)}>{i18n.t('default:batch generation')}</Button>
          </div>
        </div>
        <div className="flex-1 mt-4">{rows.map(renderItem)}</div>
      </DndProvider>
    </div>
  );
};

const doCheck = (data: Case) => {
  const { testCaseCreateReq } = data;
  const { stepAndResults = [] } = testCaseCreateReq;
  if (!(stepAndResults || []).length) {
    return i18n.t('dop:steps and results are not filled out');
  }
  const inValidNum = [] as number[];
  stepAndResults.forEach((item, i) => {
    if (!item.step || !item.result) {
      inValidNum.push(i + 1);
    }
  });
  if (inValidNum.length) {
    return i18n.t('dop:the {index} step in the steps and results is not completed', {
      index: inValidNum.join(','),
    });
  }
  return '';
};

export default DescList;
