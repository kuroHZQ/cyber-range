import React from 'react'
import {Link} from 'react-router-dom'
import {Menu} from 'antd'
import {
  MailOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from '@ant-design/icons'

const {SubMenu} = Menu

export default class extends React.Component {
  state = {
    theme: 'dark',
    current: '1',
  }

  changeTheme = value => {
    this.setState({
      theme: value ? 'dark' : 'light',
    })
  }
  handleClick = e => {
    this.setState({
      current: e.key,
    })
  }

  render() {
    const userInfo = JSON.parse(localStorage.getItem('range_userInfo'))
    return (
      //   <Switch
      //     checked={this.state.theme === 'dark'}
      //     onChange={this.changeTheme}
      //     checkedChildren="夜间模式"
      //     unCheckedChildren="日间模式"
      //   />
      <Menu
        theme={this.state.theme}
        onClick={this.handleClick}
        // style={{width: 256}}
        defaultOpenKeys={['sub1']}
        selectedKeys={[this.state.current]}
        mode="inline">
        <SubMenu
          key="sub1"
          title={
            <span>
              <MailOutlined />
              <span>靶场</span>
            </span>
          }>
          {userInfo.type === 0 && [
            <Menu.Item key="image">
              <Link
                to={{
                  pathname: '/view/image-manage',
                  query: {breadCrumbName: ['靶场', '镜像管理']},
                }}>
                镜像管理
              </Link>
            </Menu.Item>,
            <Menu.Item key="container">
              <Link
                to={{
                  pathname: '/view/container-manage',
                  query: {breadCrumbName: ['靶场', '容器管理']},
                }}>
                容器管理
              </Link>
            </Menu.Item>,
          ]}
          <Menu.Item key="course">
            <Link
              to={{
                pathname: '/view/courses',
                query: {breadCrumbName: ['靶场', 'web靶场']},
              }}>
              web安全网络靶场
            </Link>
          </Menu.Item>
          {userInfo.type === 1 && (
            <Menu.Item key="selectCourse">
              <Link
                to={{
                  pathname: '/view/selectCourses',
                  query: {breadCrumbName: ['靶场', '已选课程']},
                }}>
                已选课程
              </Link>
            </Menu.Item>
          )}
        </SubMenu>
        <SubMenu
          key="sub3"
          title={
            <span>
              <SettingOutlined />
              <span>常见网络靶场介绍</span>
            </span>
          }>
          <Menu.Item key="9">DVWA</Menu.Item>
          <Menu.Item key="10">weBug</Menu.Item>
        </SubMenu>
      </Menu>
    )
  }
}
