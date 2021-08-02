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

interface IProps {
  onChange: (...args: unknown[]) => void;
}

export class ClassWrapper extends React.PureComponent<IProps> {
  /**
   * @override
   * @param args
   */
  onChange = (...args: unknown[]) => {
    const { children, onChange } = this.props;
    // default onChange form item automatic inject
    onChange?.(...args);
    // child component onChange method
    children?.props?.onChange?.(...args);
  };
  render() {
    const { children, ...rest } = this.props;
    if (!children || typeof children !== 'object') {
      return children || null;
    }
    return React.cloneElement(children as any, {
      ...rest,
      onChange: this.onChange,
    });
  }
}
