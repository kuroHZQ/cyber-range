import React from 'react'
import {withRouter} from 'react-router-dom'
import {Menu, message} from 'antd'
import {UserOutlined} from '@ant-design/icons'

const {SubMenu} = Menu
export default
@withRouter
class extends React.Component {
  state = {
    current: '',
    userInfo: {},
  }
  componentDidMount() {
    const userInfo = JSON.parse(localStorage.getItem('range_userInfo'))
    if (userInfo && userInfo.id) {
      this.setState({userInfo})
    } else {
      message.error('您还未登录，请先登录！')
      this.props.history.push('/login')
    }
  }
  handleClick = e => {
    if (e.key === 'logout') {
      this.logout()
    }
    // this.setState({
    //   current: '',
    // })
  }
  logout = () => {
    localStorage.removeItem('range_userInfo')
    this.props.history.push('/login')
    localStorage.message.success('退出成功')
  }

  render() {
    const {userInfo} = this.state
    return (
      userInfo && (
        <Menu
          onClick={this.handleClick}
          selectedKeys={this.state.current}
          style={{float: 'right', lineHeight: '63px', marginRight: '16px'}}
          mode="horizontal">
          <Menu.Item key="identity">
            {userInfo.type === 0 ? '管理员' : '学生'}
          </Menu.Item>
          <SubMenu
            title={
              <span className="submenu-title-wrapper">
                <UserOutlined />
                {userInfo.name}
              </span>
            }>
            <Menu.Item key="logout">退出</Menu.Item>
          </SubMenu>
        </Menu>
      )
    )
  }
}
