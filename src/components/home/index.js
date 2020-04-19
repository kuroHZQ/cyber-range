import React from 'react'
import style from './index.css'
import imgUrl from '../../images/home.png'

export default class extends React.Component {
  state = {}

  render() {
    return (
      <div className={style.welcome}>
        <div className={style.imgBlock}>
          <img src={imgUrl} alt="" className={style.img} />
        </div>
        <h1 className={style.title}>欢迎回来</h1>
      </div>
    )
  }
}
