import React from 'react'
import {Button, Table, message, Modal, Select} from 'antd'
import request from '@/utils/request'

const difficultyNames = {
  0: '入门',
  1: '简单',
  2: '中级',
  3: '高级',
}
export default class extends React.Component {
  state = {
    courseList: [],
    courseTypeList: [],
    currentPort: '',
    portModalVisible: false,
    filters: {},
    loading: false,
  }
  componentDidMount = () => {
    this.getCourseList({})
    this.getCourseTypeList()
  }
  getCourseList = params => {
    const queryString = Object.keys(params)
      .map(key => (params[key] ? `${key}=${params[key]}` : ''))
      .join('&')
    request(`/api/course/list?${queryString}`).then(result => {
      this.setState({
        courseList: result.data.courseList,
      })
    })
  }
  getCourseTypeList = () => {
    request('/api/coursetype/list').then(result => {
      this.setState({
        courseTypeList: result.data.courseTypeList,
      })
    })
  }
  getColumns = () => [
    {
      title: '序号',
      render: (value, record, index) => index + 1,
    },
    {
      title: '漏洞名称',
      dataIndex: 'courseName',
    },
    {
      title: '漏洞分类',
      dataIndex: 'typeId',
      render: value => {
        const typeInfo = this.state.courseTypeList.find(
          item => item.typeId === value
        )
        return typeInfo && typeInfo.typeName
      },
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      render: value => difficultyNames[value],
    },
    {
      title: '操作',
      fixed: 'right',
      width: 100,
      render: (value, record) => {
        return (
          <a
            onClick={() => {
              this.runContainer(record)
            }}>
            打开靶场
          </a>
        )
      },
    },
  ]
  runContainer = course => {
    const config = {
      Image: course.image,
      ExposedPorts: {
        '80/tcp': {},
      },
      HostConfig: {
        // PortBindings: {
        //   '80/tcp': [{HostPort: '12100'}],
        // },
        PublishAllPorts: true,
      },
    }
    const userInfo = JSON.parse(localStorage.getItem('range_userInfo'))

    request(
      `/api/selectcourse/check?userId=${userInfo.id}&courseId=${course.courseId}`
    ).then(checkResult => {
      if (checkResult.success) {
        this.setPortModalVisible(true, '', true)
        request.post('/docker/containers/create', config).then(result => {
          const body = {
            courseId: course.courseId,
            userId: userInfo.id,
            containerId: result.Id,
          }
          request.post('/api/selectcourse/add', body).then(createResult => {
            if (createResult.success) {
              request.post(`/docker/containers/${result.Id}/start`).then(() => {
                request(`/docker/containers/${result.Id}/json`).then(
                  containerInfo => {
                    const port =
                      containerInfo.NetworkSettings.Ports['80/tcp'][0].HostPort
                    this.setPortModalVisible(true, port, false)
                  }
                )
              })
              // .catch(err => {
              //   request.delete(`/docker/containers/${result.Id}`).then(() => {
              //     message.error('端口已被占用')
              //   })
              // })
            } else {
              message.error('创建容器失败！')
            }
          })
        })
      } else {
        message.error('您已经打开了该靶场！')
      }
    })
  }
  setPortModalVisible = (portModalVisible, currentPort, loading) => {
    this.setState({
      portModalVisible,
      currentPort,
      loading,
    })
  }
  portModal = () => {
    const {portModalVisible, currentPort, loading} = this.state
    return (
      portModalVisible && (
        <Modal
          title="靶场地址"
          visible
          okText="确认"
          onOk={() => {
            this.setPortModalVisible(false, '', false)
          }}
          cancelButtonProps={{hidden: true}}>
          {loading ? (
            '靶场正在构建，请稍等...'
          ) : (
            <div>
              <span>靶场构建成功，请前往</span>{' '}
              <a
                href={`http://49.235.52.63:${currentPort}`}
                rel="noopener noreferrer"
                target="_blank">{`http://49.235.52.63:${currentPort}`}</a>
              <div>温馨提示：若页面打不开，请等待一会再刷新。</div>
            </div>
          )}
        </Modal>
      )
    )
  }
  onSelectDifficulty = value => {
    const {filters} = this.state
    this.setState({
      filters: {
        ...filters,
        difficulty: value,
      },
    })
  }
  onSelectType = value => {
    const {filters} = this.state
    this.setState({
      filters: {
        ...filters,
        typeId: value,
      },
    })
  }
  render() {
    const {courseTypeList} = this.state
    return (
      <div>
        <div style={{background: '#fff', marginBottom: 14, padding: 16}}>
          <span>靶场类别：</span>
          <Select
            style={{width: 200, marginRight: 8}}
            placeholder="请选择"
            allowClear
            onChange={value => {
              this.onSelectType(value)
            }}>
            {courseTypeList &&
              courseTypeList.map(type => {
                return (
                  <Select.Option value={type.typeId}>
                    {type.typeName}
                  </Select.Option>
                )
              })}
          </Select>
          <span>靶场难度：</span>
          <Select
            style={{width: 150, marginRight: 16}}
            placeholder="请选择"
            allowClear
            onChange={value => {
              this.onSelectDifficulty(value)
            }}>
            <Select.Option value="0">入门</Select.Option>
            <Select.Option value="1">简单</Select.Option>
            <Select.Option value="2">中级</Select.Option>
            <Select.Option value="3">高级</Select.Option>
          </Select>
          {/* <Button>重置</Button> */}
          <Button
            type="primary"
            onClick={() => {
              this.getCourseList(this.state.filters)
            }}>
            查询
          </Button>
        </div>
        <div style={{background: '#fff'}}>
          <Table
            columns={this.getColumns()}
            dataSource={this.state.courseList}
          />
          {this.portModal()}
        </div>
      </div>
    )
  }
}
