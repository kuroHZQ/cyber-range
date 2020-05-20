import React from 'react'
import moment from 'moment'
import {Table, message, Popconfirm, Spin, Select, Button, Input} from 'antd'
import request from '@/utils/request'

export default class extends React.Component {
  state = {
    containerList: [],
    imageList: [],
    loading: [],
    filters: {},
  }
  componentDidMount() {
    this.getContainerList()
    this.getImageList()
  }
  getColumns = () => [
    {
      title: '容器ID',
      dataIndex: 'Id',
      render: value => value.slice(0, 12),
    },
    // {
    //   title: '容器名称',
    //   dataIndex: 'Names',
    // },
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
      title: '端口号(内部端口号)',
      dataIndex: 'Ports',
      render: value => {
        const portsInfo = value.filter(item => item.IP === '0.0.0.0')
        return portsInfo && portsInfo.length
          ? portsInfo
              .map(item => `${item.PublicPort}(${item.PrivatePort})`)
              .join(',')
          : '-'
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
              style={{marginRight: '4px', display: 'inline-Block'}}
              onClick={() => {
                this.closeContainer(record.Id)
              }}>
              <Spin
                spinning={this.state.loading[`close_${record.Id}`] || false}>
                关闭
              </Spin>
            </a>
          ) : (
            <a
              style={{marginRight: '4px', display: 'inline-Block'}}
              onClick={() => {
                this.openContainer(record.Id)
              }}>
              <Spin spinning={this.state.loading[`open_${record.Id}`] || false}>
                打开
              </Spin>
            </a>
          ),
          <Popconfirm
            placement="topRight"
            title="确认删除吗"
            onConfirm={() => this.deleteContainer(value.Id)}
            okText="确认"
            cancelText="取消">
            <a style={{marginRight: '4px'}}>删除</a>
          </Popconfirm>,
        ]
      },
    },
  ]
  getImageList = () => {
    request('/docker/images/json').then(result => {
      this.setState({imageList: result})
    })
  }
  getContainerList = () => {
    const {filters} = this.state
    const dockerFilters = {
      status: filters.status,
    }
    request(
      `/docker/containers/json?all=1&filters=${JSON.stringify(dockerFilters)}`
    ).then(result => {
      let newResult = result
      if (filters.image) {
        newResult = result.filter(item => item.ImageID === filters.image)
      }
      this.setState({containerList: newResult})
    })
  }
  openContainer = id => {
    const {loading} = this.state
    loading[`open_${id}`] = true
    request
      .post(`/docker/containers/${id}/start`)
      .then(() => {
        this.getContainerList()
        message.success('打开容器成功')
        loading[`open_${id}`] = false
        this.setState({loading})
      })
      .catch(() => {
        loading[`open_${id}`] = false
        this.setState({loading})
      })
  }
  closeContainer = id => {
    const {loading} = this.state
    loading[`close_${id}`] = true
    this.setState({loading})
    request
      .post(`/docker/containers/${id}/stop`)
      .then(() => {
        this.getContainerList()
        message.success('关闭容器成功')
        loading[`close_${id}`] = false
        this.setState({loading})
      })
      .catch(() => {
        loading[`close_${id}`] = false
        this.setState({loading})
      })
  }
  deleteContainer = id => {
    request.delete(`/docker/containers/${id}`).then(() => {
      request.delete(`/api/selectcourse/deleteByContainerId/${id}`).then(() => {
        this.getContainerList()
        message.success('删除容器成功')
      })
    })
  }
  onInputId = e => {
    const {filters} = this.state
    this.setState({
      filters: {
        ...filters,
        id: e.target.value,
      },
    })
  }
  onSelectStatus = value => {
    const {filters} = this.state
    this.setState({
      filters: {
        ...filters,
        status: value,
      },
    })
  }
  onSelectImage = value => {
    const {filters} = this.state
    this.setState({
      filters: {
        ...filters,
        image: value,
      },
    })
  }
  render() {
    const {imageList} = this.state
    return (
      <div>
        <div style={{background: '#fff', marginBottom: 14, padding: 16}}>
          {/* <span>容器ID：</span>
          <Input
            style={{width: 200, marginRight: 8}}
            placeholder="请输入"
            allowClear
            onChange={this.onInputId}
          /> */}
          <span>状态：</span>
          <Select
            style={{width: 230, marginRight: 16}}
            placeholder="请选择"
            allowClear
            mode="multiple"
            onChange={value => {
              this.onSelectStatus(value)
            }}>
            <Select.Option value="created">created</Select.Option>
            <Select.Option value="running">running</Select.Option>
            <Select.Option value="exited">exited</Select.Option>
          </Select>
          <span>所用镜像：</span>
          <Select
            style={{width: 230, marginRight: 16}}
            placeholder="请选择"
            allowClear
            onChange={value => {
              this.onSelectImage(value)
            }}>
            {imageList &&
              imageList.map(item => {
                return (
                  <Select.Option value={item.Id}>
                    {item.RepoTags[0]}
                  </Select.Option>
                )
              })}
          </Select>
          {/* <Button>重置</Button> */}
          <Button
            type="primary"
            onClick={() => {
              this.getContainerList()
            }}>
            查询
          </Button>
        </div>
        <div style={{background: '#fff'}}>
          <Table
            columns={this.getColumns()}
            dataSource={this.state.containerList}
          />
        </div>
      </div>
    )
  }
}
