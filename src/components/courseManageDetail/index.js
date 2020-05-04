import React from 'react'
import {
  Button,
  Table,
  message,
  Modal,
  Input,
  Form,
  PageHeader,
  Select,
  Popconfirm,
} from 'antd'
import request from '@/utils/request'
import query from '@/utils/query'

const difficultyNames = {
  0: '入门',
  1: '简单',
  2: '中级',
  3: '高级',
}
const difficultyOptions = [
  {
    label: '入门',
    value: 0,
  },
  {
    label: '简单',
    value: 1,
  },
  {
    label: '中级',
    value: 2,
  },
  {
    label: '高级',
    value: 3,
  },
]
const layout = {
  labelCol: {span: 8},
  wrapperCol: {span: 16},
}
export default
@Form.create()
class extends React.Component {
  state = {
    courseList: [],
    imageList: [],
    courseType: {},
    currentCourse: {},
    editModalVisible: false,
    isEdit: false,
    userList: [],
    userListModalVisible: false,
  }
  componentDidMount = () => {
    this.getCourseList()
    this.getCourseTypeList()
    this.getImageList()
  }
  getImageList = () => {
    request('/docker/images/json').then(result => {
      this.setState({
        imageList: result,
      })
    })
  }
  getCourseList = () => {
    const id = query.get('id')
    request(`/api/course/list?typeId=${id}`).then(result => {
      this.setState({
        courseList: result.data.courseList,
      })
    })
  }
  getCourseTypeList = () => {
    const id = query.get('id')
    request(`/api/coursetype/list?typeId=${id}`).then(result => {
      this.setState({
        courseType: result.data.courseTypeList[0],
      })
    })
  }
  getUserList = courseId => {
    request(`/api/selectcourse/user/list?courseId=${courseId}`).then(result => {
      this.setState(
        {
          userList: result.data.selectCourseStudentList,
        },
        () => {
          this.setUserListModalVisible(true)
        }
      )
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
      title: '所用镜像',
      dataIndex: 'image',
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      render: value => difficultyNames[value],
    },
    {
      title: '操作',
      fixed: 'right',
      width: 200,
      render: (value, record) => {
        return [
          <a
            onClick={() => {
              this.getUserList(record.courseId)
            }}>
            查看使用用户
          </a>,
          <a
            onClick={() => {
              this.setEditModalVisible(true, record, true)
            }}>
            编辑
          </a>,
          <Popconfirm
            placement="topRight"
            title="确认删除吗"
            onConfirm={() => this.deleteCourse(record.courseId)}
            okText="确认"
            cancelText="取消">
            <a>删除</a>
          </Popconfirm>,
        ]
      },
    },
  ]
  setEditModalVisible = (editModalVisible, currentCourse, isEdit) => {
    this.setState({
      editModalVisible,
      currentCourse,
      isEdit,
    })
  }
  setUserListModalVisible = userListModalVisible => {
    this.setState({
      userListModalVisible,
    })
  }
  editModal = () => {
    const {editModalVisible, currentCourse, isEdit} = this.state
    const {getFieldDecorator} = this.props.form
    return (
      editModalVisible && (
        <Modal
          title={`${isEdit ? '编辑' : '添加'}靶场`}
          visible
          okText="确认"
          cancelText="取消"
          onOk={isEdit ? this.editCourse : this.addCourse}
          onCancel={() => {
            this.setEditModalVisible(false, {}, !isEdit)
          }}>
          <Form {...layout} name="basic" size="middle">
            <Form.Item label="靶场名称">
              {getFieldDecorator('courseName', {
                rules: [
                  {
                    required: true,
                    message: '靶场名称不能为空',
                  },
                ],
                initialValue: currentCourse.courseName,
              })(<Input style={{width: 300}} placeholder="请输入" />)}
            </Form.Item>
            <Form.Item label="所用镜像">
              {getFieldDecorator('image', {
                rules: [
                  {
                    required: true,
                    message: '所用镜像不能为空！',
                  },
                ],
                initialValue: currentCourse.image,
              })(
                <Select style={{width: 300}} placeholder="请选择">
                  {this.state.imageList &&
                    this.state.imageList.map(item => (
                      <Select.Option value={item.RepoTags[0]}>
                        {item.RepoTags[0]}
                      </Select.Option>
                    ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="难度">
              {getFieldDecorator('difficulty', {
                rules: [
                  {
                    required: true,
                    message: '难度不能为空',
                  },
                ],
                initialValue: currentCourse.difficulty,
              })(
                <Select style={{width: 300}} placeholder="请选择">
                  {difficultyOptions.map(item => (
                    <Select.Option value={item.value}>
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    )
  }
  userListModal = () => {
    const {userList, userListModalVisible} = this.state
    return (
      userListModalVisible && (
        <Modal
          title="正在使用的用户"
          visible
          okText="确认"
          // cancelText="取消"
          onOk={() => this.setUserListModalVisible(false, [])}
          // onCancel={() => this.setUserListModalVisible(false, [])}
          cancelButtonProps={{hidden: true}}>
          {userList &&
            userList.map((userInfo, index) => {
              return (
                <div>
                  <div>用户{index + 1}:</div>
                  <div>
                    ID: {userInfo.id} 姓名: {userInfo.name} 身份:{' '}
                    {userInfo.type ? '学生' : '管理员'} 容器ID:
                    {userInfo.containerId.slice(0, 12)}
                  </div>
                </div>
              )
            })}
          {userList && userList.length === 0 && <div>暂无使用用户</div>}
        </Modal>
      )
    )
  }
  addCourse = () => {
    const {courseType} = this.state
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      const body = {
        ...values,
        typeId: courseType.typeId,
      }
      request.post('/api/course/add', body).then(result => {
        if (result.success) {
          message.success('添加成功！')
          this.setEditModalVisible(false, {}, false)
          this.getCourseList()
        } else {
          message.error(result.message)
        }
      })
    })
  }
  editCourse = () => {
    const {courseType, currentCourse} = this.state
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      const body = {
        ...values,
        typeId: courseType.typeId,
        courseId: currentCourse.courseId,
      }
      request.post('/api/course/edit', body).then(result => {
        if (result.success) {
          message.success('添加成功！')
          this.setEditModalVisible(false, {}, false)
          this.getCourseList()
        } else {
          message.error(result.message)
        }
      })
    })
  }
  deleteCourse = id => {
    request.delete(`/api/course/delete/${id}`).then(result => {
      if (result.success) {
        message.success('删除成功！')
        this.getCourseList()
      } else {
        message.error(result.message)
      }
    })
  }
  render() {
    return (
      <div style={{background: '#fff'}}>
        <PageHeader
          onBack={() => window.history.back()}
          title={this.state.courseType.typeName}
          extra={[
            <Button
              key="addCourse"
              type="primary"
              onClick={() => {
                this.setEditModalVisible(true, {}, false)
              }}>
              添加靶场
            </Button>,
          ]}
        />
        <Table columns={this.getColumns()} dataSource={this.state.courseList} />
        {this.editModal()}
        {this.userListModal()}
      </div>
    )
  }
}
