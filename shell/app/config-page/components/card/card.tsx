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
import { Icon as CustomIcon } from 'common';
import { Dropdown, Menu, Popconfirm, Tooltip } from 'app/nusi';
import { isString, isEmpty, map } from 'lodash';
import { WithAuth } from 'user/common';
import { useDrag } from 'react-dnd';
import classnames from 'classnames';
import './card.scss';


const fakeClick = 'fake-click';
const noop = () => { };

export const Card = (props: CP_CARD.Props) => {
  const { props: configProps, execOperation = noop, customProps = {} } = props;
  const { cardType, data, className = '' } = configProps;
  const { clickNode = noop } = customProps;
  const { id, titleIcon, title, operations, subContent, description, extraInfo } = data?._infoData || {};
  const { drag: dragOperation, ...menuOperations } = operations || {};
  const [dragObj, drag] = useDrag({
    item: { type: cardType, data: { ...data, drag: { ...(dragOperation || {}), key: 'drag' } } },
    canDrag: () => {
      return dragOperation && !dragOperation.disabled;
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opRef = React.useRef(null);

  const onClick = (k: string) => {
    if (!k.startsWith(fakeClick)) {
      execOperation({ ...((operations && operations[k]) || {}), key: k, reload: true });
    }
  };

  const getMenu = () => {
    return (
      <Menu onClick={(e: any) => {
        e.domEvent.stopPropagation();
        onClick(e.key);
      }}
      >
        {
          map(menuOperations, (item, key) => {
            if (item.disabled) {
              return (
                <Menu.Item key={key}>
                  <WithAuth pass={false} key={key} noAuthTip={item.disabledTip}>
                    <span>{item.text}</span>
                  </WithAuth>
                </Menu.Item>
              );
            }
            if (item.confirm) {
              return (
                <Menu.Item key={`${fakeClick}-${key}`}>
                  <Popconfirm title={item.confirm} onConfirm={() => onClick(key)}>
                    <span>{item.text}</span>
                  </Popconfirm>
                </Menu.Item>
              );
            }
            return <Menu.Item key={key}>{item.text}</Menu.Item>;
          })
        }
      </Menu>
    );
  };
  const cls = classnames({
    'drag-wrap': true,
    dragging: dragObj && dragObj.isDragging,
    'dice-cp': true,
    'info-card': true,
    'border-radius': true,
    'hover-active-bg': true,
    'border-all': true,
  });
  return (
    <div className={`${className} ${cls}`} onClick={() => clickNode(data)}>
      <div className='info-card-content px12 py8' key={id} ref={drag}>
        <div className={'info-card-head flex-box mb8'}>
          {
            isString(titleIcon)
              ? <CustomIcon type={titleIcon} color className='head-icon mr4' />
              : (titleIcon || null)
          }
          <div className='flex-1 fz14 color-text break-word'>{title}</div>
          {
            isEmpty(menuOperations)
              ? <CustomIcon className='op-icon hide-icon' onClick={e => e.stopPropagation()} type="more" />
              : (
                <span ref={opRef}>
                  <Dropdown overlay={getMenu()} getPopupContainer={() => opRef.current as any}>
                    <CustomIcon className='op-icon' onClick={e => e.stopPropagation()} type="more" />
                  </Dropdown>
                </span>
              )
          }
        </div>
        {
          isString(subContent) ? <div className='fz12 color-text-sub mb12'>{subContent}</div> : (subContent || null)
        }
        {
          isString(description) ? (
            <Tooltip title={description}>
              <div className='fz12 nowrap color-text-desc'>{description}</div>
            </Tooltip>
          ) : (description || null)
        }
        {extraInfo}
      </div>
    </div>
  );
};

