import React, { useState } from 'react'
import Card from '../../../components/shared/Card/Card'
import TextInput from '../../../components/shared/TextInput/TextInput'
import Button from '../../../components/shared/Button/Button'
import styles from './StepAvatar.module.css'

import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import {setAvatar} from '../../../store/activateSlice'

import {activate} from '../../../http/index'
import { setAuth } from '../../../store/authSlice'

const StepAvatar = ({onNext}) => {
  const {name,avatar}=useSelector(state=>state.activate)
  const [image,setImage]=useState('/images/monkey-avatar.png')
  const dispatch=useDispatch()

  const captureImage=(e)=>{
    console.log(e)
    const file=e.target.files[0]
    //Reader to convert to base64 string
    const reader=new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend=()=>{
      console.log(reader.result)
      setImage(reader.result)
      dispatch(setAvatar(reader.result))
    }
  }

  const submit=async ()=>{
    try{
      const {data}=await activate({name,avatar})
      if(data.auth){
        dispatch(setAuth(data))
      }
      console.log(data)
    }catch(err){
        console.log(err)
    }
    // onNext()
  }
  return (
    <>
        <Card title={`Okay ${name}!`} logo='TopeWala'>
            {/* <TextInput value={fullName} onChange={(e)=>setFullName(e.target.value)}></TextInput> */}
            <p className={styles.subHeading}>How is this profile pic</p>
            <div className={styles.avatarWrapper}>
              <img className={styles.avatarPic} src={image} alt="profile Pic" />
            </div>
            <div>
              <input type='file' onChange={captureImage} id="avatarInput" className={styles.avatarInput}/>
              <label htmlFor="avatarInput" className={styles.avatarLabel}>Choose a different photo</label>
            </div>
            <div>
                <div className={styles.actionButton}>
                    <Button text='Next' icon='arrow' onClick={submit}></Button>
                </div>
            </div>
            
        </Card>
    </>
  )
}

export default StepAvatar