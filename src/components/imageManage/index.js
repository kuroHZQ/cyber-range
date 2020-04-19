import React from 'react'
import moment from 'moment'
import {Table, message, Popconfirm} from 'antd'
import request from '@/utils/request'

function conver(limit) {
  let size = ''
  if (limit < 0.1 * 1024) {
    // 如果小于0.1KB转化成B
    size = `${limit.toFixed(2)}B`
  } else if (limit < 0.1 * 1024 * 1024) {
    // 如果小于0.1MB转化成KB
    size = `${(limit / 1024).toFixed(2)}KB`
  } else if (limit < 0.1 * 1024 * 1024 * 1024) {
    // 如果小于0.1GB转化成MB
    size = `${(limit / (1024 * 1024)).toFixed(2)}MB`
  } else {
    // 其他转化成GB
    size = `${(limit / (1024 * 1024 * 1024)).toFixed(2)}GB`
  }

  let sizestr = `${size}`
  let len = sizestr.indexOf('.')
  let dec = sizestr.substr(len + 1, 2)
  if (dec === '00') {
    // 当小数点后为00时 去掉小数部分
    return sizestr.substring(0, len) + sizestr.substr(len + 3, 2)
  }
  return sizestr
}
export default class extends React.Component {
  state = {
    imageList: [],
  }
  componentDidMount() {
    request('/docker/images/json').then(result => {
      this.setState({imageList: result})
    })
  }
  getColumns = () => [
    {
      title: '镜像ID',
      dataIndex: 'Id',
      width: 250,
      tip: true,
    },
    {
      title: '镜像库地址',
      dataIndex: 'RepoTags',
    },
    {
      title: '容器数',
      dataIndex: 'Containers',
    },
    {
      title: '创建时间',
      dataIndex: 'Created',
      render: value => {
        return moment.unix(value).format('YYYY-MM-DD HH:mm:ss')
      },
    },
    {
      title: '镜像大小',
      dataIndex: 'Size',
      width: 250,
      render: value => conver(value),
    },
    {
      title: '操作',
      fixed: 'right',
      width: 100,
      render: value => {
        return (
          <Popconfirm
            placement="topRight"
            title="确认删除吗"
            onConfirm={() => this.deleteImage(value.id)}
            okText="确认"
            cancelText="取消">
            <a>删除</a>
          </Popconfirm>
        )
      },
    },
  ]
  deleteImage = () => {}
  render() {
    return (
      <div style={{background: '#fff'}}>
        <Table columns={this.getColumns()} dataSource={this.state.imageList} />
      </div>
    )
  }
}
