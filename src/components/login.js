import React from 'react'
import {message, Form, Input, Button} from 'antd'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  IdcardOutlined,
} from '@ant-design/icons'
import request from '@/utils/request'
import style from '../App.css'

const layout = {
  labelCol: {span: 8},
  wrapperCol: {span: 16},
}
export default
@Form.create()
class extends React.Component {
  state = {
    isLogin: true,
  }
  componentDidMount() {
    const userInfo = JSON.parse(localStorage.getItem('range_userInfo'))
    if (userInfo && userInfo.id) {
      this.props.history.push('/view')
      message.success('欢迎回来~')
    }
  }
  login = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      request(
        `/api/user/login?username=${values.username}&password=${values.password}`
      ).then(result => {
        if (result.message === 'success') {
          const userInfo = JSON.stringify(result.data.userInfo)
          localStorage.setItem('range_userInfo', userInfo)
          this.props.history.push('/view')
          message.success('登录成功，欢迎您~')
        } else {
          message.error('用户名或密码错误！')
        }
      })
    })
  }
  register = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      const body = {
        ...values,
        type: 1,
      }
      request.post('/api/user/register', body).then(result => {
        if (result.success) {
          message.success('注册成功，请登录')
          this.setState({isLogin: true})
        } else {
          message.error(result.message)
        }
      })
    })
  }
  render() {
    const {getFieldDecorator} = this.props.form
    const {isLogin} = this.state
    return (
      <div
        style={{
          postion: 'relative',
          width: '100%',
          height: '100%',
          background: 'gray',
        }}>
        <div className={style.loginContainer}>
          <div>{`用户${isLogin ? '登录' : '注册'}`}</div>
          <Form
            {...layout}
            name="basic"
            initialValues={{remember: true}}
            size="middle">
            <Form.Item width="100%">
              {getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    message: '请输入用户名',
                  },
                ],
              })(
                <Input
                  style={{width: 300}}
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名"
                />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [
                  {
                    required: true,
                    message: '请输入密码',
                  },
                ],
              })(
                <Input.Password
                  style={{width: 300}}
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                />
              )}
            </Form.Item>
            {!isLogin
              ? [
                  <Form.Item>
                    {getFieldDecorator('name', {
                      rules: [
                        {
                          required: true,
                          message: '请输入你的名字',
                        },
                      ],
                    })(
                      <Input
                        style={{width: 300}}
                        prefix={<IdcardOutlined />}
                        placeholder="请输入你的名字"
                      />
                    )}
                  </Form.Item>,
                  <Form.Item>
                    {getFieldDecorator('email', {
                      rules: [
                        {
                          required: false,
                          message: '请输入你的邮箱',
                        },
                      ],
                    })(
                      <Input
                        style={{width: 300}}
                        prefix={<MailOutlined />}
                        placeholder="请输入你的邮箱(非必填)"
                      />
                    )}
                  </Form.Item>,
                ]
              : []}
          </Form>
          <Button
            style={{width: 300}}
            type="primary"
            onClick={isLogin ? this.login : this.register}>
            {isLogin ? '登录' : '注册'}
          </Button>
          <a
            onClick={() => {
              this.setState({isLogin: !isLogin})
            }}>
            {isLogin ? '没有账号，立即注册' : '返回登录'}
          </a>
        </div>
      </div>
    )
  }
}
