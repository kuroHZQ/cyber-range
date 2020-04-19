import React from 'react'
import {Button, Table} from 'antd'
import request from '@/utils/request'

export default class extends React.Component {
  state = {}
  runContainer = () => {
    request('/docker/info').then(result => {
      console.log(result)
    })
  }
  render() {
    return (
      <div>
        this is course
        <Button onClick={this.runContainer}>打开靶场</Button>
      </div>
    )
  }
}
