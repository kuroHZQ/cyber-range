/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react'
import {Modal, Card, Popconfirm, Form, Input, message} from 'antd'
import {EditOutlined, CloseOutlined, PlusOutlined} from '@ant-design/icons'
import request from '@/utils/request'
import style from './index.css'
import imgUrl from '../../images/courseIcon.jpg'

const {Meta} = Card
const layout = {
  labelCol: {span: 8},
  wrapperCol: {span: 16},
}
export default
@Form.create()
class extends React.Component {
  state = {
    courseTypeList: [],
    currentType: {},
    editModalVisible: false,
    isEdit: false,
  }
  componentDidMount = () => {
    this.getCourseTypeList()
  }
  getCourseTypeList = () => {
    request('/api/coursetype/list').then(result => {
      this.setState({
        courseTypeList: result.data.courseTypeList,
      })
    })
  }
  setEditModalVisible = (editModalVisible, currentType, isEdit) => {
    this.setState({
      editModalVisible,
      currentType,
      isEdit,
    })
  }
  editType = () => {
    const {currentType} = this.state
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      const body = {
        ...values,
        typeId: currentType.typeId,
      }
      request.post('/api/coursetype/edit', body).then(result => {
        if (result.success) {
          message.success('编辑成功！')
          this.setEditModalVisible(false, {}, false)
          this.getCourseTypeList()
        } else {
          message.error(result.message)
        }
      })
    })
  }
  addType = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      const body = {
        ...values,
      }
      request.post('/api/coursetype/add', body).then(result => {
        if (result.success) {
          message.success('添加成功！')
          this.setEditModalVisible(false, {}, false)
          this.getCourseTypeList()
        } else {
          message.error(result.message)
        }
      })
    })
  }
  editModal = () => {
    const {getFieldDecorator} = this.props.form
    const {editModalVisible, currentType, isEdit} = this.state
    return (
      editModalVisible && (
        <Modal
          title={`${isEdit ? '编辑' : '添加'}靶场类别`}
          visible
          okText="确认"
          cancelText="取消"
          onOk={isEdit ? this.editType : this.addType}
          onCancel={() => {
            this.setEditModalVisible(false, {}, !isEdit)
          }}>
          {currentType && (
            <Form {...layout} name="basic" size="middle">
              <Form.Item label="靶场类别名称">
                {getFieldDecorator('typeName', {
                  rules: [
                    {
                      required: true,
                      message: '靶场类别名称不能为空',
                    },
                  ],
                  initialValue: currentType.typeName,
                })(<Input style={{width: 300}} placeholder="请输入" />)}
              </Form.Item>
              <Form.Item label="类别描述">
                {getFieldDecorator('typeDesc', {
                  rules: [
                    {
                      required: true,
                      message: '类别描述不能为空',
                    },
                  ],
                  initialValue: currentType.typeDesc,
                })(
                  <Input.TextArea style={{width: 300}} placeholder="请输入" />
                )}
              </Form.Item>
            </Form>
          )}
        </Modal>
      )
    )
  }
  deleteType = id => {
    request.delete(`/api/coursetype/delete/${id}`).then(result => {
      if (result.success) {
        message.success('删除成功！')
        this.getCourseTypeList()
      } else {
        message.error(result.message)
      }
    })
  }
  render() {
    const {courseTypeList} = this.state
    return (
      <div
        style={{
          // background: '#fff',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
        }}>
        {courseTypeList &&
          courseTypeList.map(type => {
            return (
              <div style={{flex: '0 0 auto'}}>
                <Card
                  hoverable
                  className={style.cardContainer}
                  cover={
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        // width: 240,
                        height: 160,
                        // padding: 26,
                      }}>
                      <div style={{width: 140, height: 125}}>
                        <img
                          alt="example"
                          src={imgUrl}
                          className={style.img}
                          onClick={() => {
                            this.props.history.push(
                              `/view/course-manage/detail?id=${type.typeId}`
                            )
                          }}
                        />
                      </div>
                    </div>
                  }
                  actions={[
                    <EditOutlined
                      key="edit"
                      onClick={() => {
                        this.setEditModalVisible(true, type, true)
                      }}
                    />,
                    <Popconfirm
                      placement="topRight"
                      title="确认删除吗"
                      onConfirm={() => this.deleteType(type.typeId)}
                      okText="确认"
                      cancelText="取消">
                      <CloseOutlined key="delete" />,
                    </Popconfirm>,
                  ]}>
                  <Meta title={type.typeName} description={type.typeDesc} />
                </Card>
              </div>
            )
          })}
        <div style={{flex: 1}}>
          <Card
            hoverable
            className={style.cardContainer}
            cover={
              <div
                style={{
                  height: 160,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <PlusOutlined
                  style={{fontSize: 40}}
                  onClick={() => this.setEditModalVisible(true, {}, false)}
                />
              </div>
            }>
            <Meta title="添加类别" description="点击按钮添加类别" />
          </Card>
        </div>
        {this.editModal()}
      </div>
    )
  }
}
