import React from 'react'
import {Button, Table, message, Modal, Spin} from 'antd'
import request from '@/utils/request'

const difficultyNames = {
  0: '入门',
  1: '简单',
  2: '中级',
  3: '高级',
}
export default class extends React.Component {
  state = {
    selectCourseList: [],
    currentPort: '',
    portModalVisible: false,
    loading: [],
  }
  componentDidMount = () => {
    this.getSelectCourseList()
  }
  getSelectCourseList = () => {
    const userInfo = JSON.parse(localStorage.getItem('range_userInfo'))
    request(`/api/selectcourse/list?userId=${userInfo.id}`).then(result => {
      this.setState({
        selectCourseList: result.data.selectCourseList,
      })
    })
  }
  getColumns = () => [
    {
      title: '序号',
      render: (value, record, index) => index + 1,
    },
    {
      title: '靶场名称',
      dataIndex: 'courseName',
    },
    {
      title: '靶场分类',
      dataIndex: 'typeName',
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
        return [
          <a
            onClick={() => {
              this.runContainer(record)
            }}>
            打开
          </a>,
          <a
            onClick={() => {
              this.closeContainer(record)
            }}>
            <Spin
              spinning={
                this.state.loading[`close_${record.containerId}`] || false
              }>
              关闭
            </Spin>
          </a>,
        ]
      },
    },
  ]
  runContainer = course => {
    request(`/docker/containers/${course.containerId}/json`).then(
      containerInfo => {
        if (!containerInfo.State.Running) {
          request
            .post(`/docker/containers/${course.containerId}/start`)
            .then(() => {
              this.runContainer(course)
            })
        } else {
          const port = containerInfo.NetworkSettings.Ports['80/tcp'][0].HostPort
          this.setPortModalVisible(true, port)
        }
      }
    )
  }
  closeContainer = selectCourse => {
    const {containerId: id} = selectCourse
    const {loading} = this.state
    loading[`close_${id}`] = true
    this.setState({loading})
    request
      .post(`/docker/containers/${id}/stop`)
      .then(() => {
        this.deleteContainer(selectCourse)
      })
      .catch(() => {
        loading[`close_${id}`] = false
        this.setState({loading})
      })
  }
  deleteContainer = selectCourse => {
    const {containerId: id} = selectCourse
    const {loading} = this.state
    request
      .delete(`/docker/containers/${id}`)
      .then(() => {
        this.deleteSelectCourse(selectCourse)
      })
      .catch(() => {
        loading[`close_${id}`] = false
        this.setState({loading})
      })
  }
  deleteSelectCourse = selectCourse => {
    const {loading} = this.state
    const {containerId: id} = selectCourse
    request
      .delete(`/api/selectcourse/delete/${selectCourse.selectId}`)
      .then(() => {
        this.getSelectCourseList()
        message.success('靶场关闭成功')
        loading[`close_${id}`] = false
        this.setState({loading})
      })
      .catch(() => {
        loading[`close_${id}`] = false
        this.setState({loading})
      })
  }
  setPortModalVisible = (portModalVisible, currentPort) => {
    this.setState({
      portModalVisible,
      currentPort,
    })
  }
  portModal = () => {
    const {portModalVisible, currentPort} = this.state
    return (
      portModalVisible && (
        <Modal
          title="靶场地址"
          visible
          okText="确认"
          onOk={() => {
            this.setPortModalVisible(false)
          }}
          cancelButtonProps={{hidden: true}}>
          靶场构建成功，请前往
          <a
            href={`http://49.235.52.63:${currentPort}`}
            rel="noopener noreferrer"
            target="_blank">{`http://49.235.52.63:${currentPort}`}</a>
          <div>温馨提示：若页面打不开，请等待一会再刷新。</div>
        </Modal>
      )
    )
  }
  render() {
    return (
      <div style={{background: '#fff'}}>
        <Table
          columns={this.getColumns()}
          dataSource={this.state.selectCourseList}
        />
        {this.portModal()}
      </div>
    )
  }
}
