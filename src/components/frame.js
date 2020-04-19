import React from 'react'
import {Route} from 'react-router-dom'
import {Layout, Breadcrumb} from 'antd'
import _ from 'lodash'
import Menu from './menu'
import HeaderTab from './header'
import Home from './home'
import Courses from './courses'
import ImageManage from './imageManage'
import ContainerManage from './containerManage'

// eslint-disable-next-line object-curly-newline
const {Header, Content, Footer, Sider} = Layout

export default class extends React.Component {
  state = {
    collapsed: false,
  }
  componentDidMount() {}
  onCollapse = collapsed => {
    this.setState({collapsed})
  }
  render() {
    const breadCrumbName = _.get(this.props, 'location.query.breadCrumbName')
    return (
      <Layout style={{minHeight: '100vh'}}>
        <Sider
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}>
          <div
            style={{
              height: '64px',
              background: 'gray',
            }}>
            网络靶场logo
          </div>
          <Menu />
        </Sider>
        <Layout>
          <Header
            style={{
              background: '#fff',
              padding: '0px 4px 0px 0px',
              boxShadow: 'rgba(127, 115, 161, 0.2) 0px 2px 5px',
            }}>
            {breadCrumbName && (
              <Breadcrumb
                style={{display: 'inline-block', margin: '16px 0 0 16px'}}>
                {breadCrumbName.map(item => {
                  return <Breadcrumb.Item>{item}</Breadcrumb.Item>
                })}
              </Breadcrumb>
            )}
            <HeaderTab />
          </Header>
          <Content style={{margin: '0 16px', paddingTop: '24px'}}>
            <Route path="/view" exact component={Home} />
            <Route path="/view/courses" exact component={Courses} />
            <Route path="/view/image-manage" exact component={ImageManage} />
            <Route
              path="/view/container-manage"
              exact
              component={ContainerManage}
            />
          </Content>
          <Footer style={{textAlign: 'center'}}>网络靶场训练环境</Footer>
        </Layout>
      </Layout>
    )
  }
}
