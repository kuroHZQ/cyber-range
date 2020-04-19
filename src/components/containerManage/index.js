import React from 'react'
import moment from 'moment'
import {Table, message, Popconfirm} from 'antd'
import request from '@/utils/request'

export default class extends React.Component {
  state = {
    containerList: [],
  }
  componentDidMount() {
    this.getContainerList()
  }
  getColumns = () => [
    {
      title: '容器名称',
      dataIndex: 'Names',
    },
    {
      title: '所用镜像',
      dataIndex: 'Image',
    },
    {
      title: '创建时间',
      dataIndex: 'Created',
      render: value => {
        return moment.unix(value).format('YYYY-MM-DD HH:mm:ss')
      },
    },
    {
      title: '状态',
      dataIndex: 'State',
    },
    {
      title: '运行时间',
      dataIndex: 'Status',
    },
    {
      title: '端口号',
      dataIndex: 'Ports',
      render: value => {
        const portInfo = value.find(item => item.IP === '0.0.0.0')
        return portInfo ? portInfo.PublicPort : '-'
      },
    },
    {
      title: '操作',
      fixed: 'right',
      width: 100,
      render: (value, record) => {
        return [
          record.State === 'running' ? (
            <a
              style={{marginRight: '4px'}}
              onClick={() => {
                this.closeContainer(record.Id)
              }}>
              关闭
            </a>
          ) : (
            <a
              style={{marginRight: '4px'}}
              onClick={() => {
                this.openContainer(record.Id)
              }}>
              打开
            </a>
          ),
          <Popconfirm
            placement="topRight"
            title="确认删除吗"
            onConfirm={() => this.deleteContainer(value.id)}
            okText="确认"
            cancelText="取消">
            <a style={{marginRight: '4px'}}>删除</a>
          </Popconfirm>,
        ]
      },
    },
  ]
  getContainerList = () => {
    request('/docker/containers/json?all=1').then(result => {
      this.setState({containerList: result})
    })
  }
  openContainer = id => {
    request.post(`/docker/containers/${id}/start`).then(result => {
      this.getContainerList()
      message.success('打开容器成功')
    })
  }
  closeContainer = id => {
    request.post(`/docker/containers/${id}/stop`).then(result => {
      this.getContainerList()
      message.success('关闭容器成功')
    })
  }
  deleteContainer = () => {}
  render() {
    return (
      <div style={{background: '#fff'}}>
        <Table
          tableKey={this.state.tableKey}
          columns={this.getColumns()}
          dataSource={this.state.containerList}
        />
      </div>
    )
  }
}
