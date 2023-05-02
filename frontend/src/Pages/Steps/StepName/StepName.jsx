import React, { useState } from 'react'
import Card from '../../../components/shared/Card/Card'
import TextInput from '../../../components/shared/TextInput/TextInput'
import Button from '../../../components/shared/Button/Button'
import styles from './StepName.module.css'

import { useDispatch } from 'react-redux'
import { setName } from '../../../store/activateSlice'
import { useSelector } from 'react-redux'

const StepName = ({onNext}) => {
  const dispatch=useDispatch()
  const {name}=useSelector((state)=>state.activate)

  const [fullName,setFullName]=useState(name)
  const submit=()=>{
    if(!fullName){
      return;
    }
    dispatch(setName(fullName))
    onNext()
  }
  return (
    <>
        <Card title='Whats your full name ?' logo='smileyLens'>
            <TextInput value={fullName} onChange={(e)=>setFullName(e.target.value)}></TextInput>
            <p className={styles.paragraph}>Provide a real name people will know you from this</p>
            <div>
                <div className={styles.actionButton}>
                    <Button text='Next' icon='arrow' onClick={submit}></Button>
                </div>
            </div>
            
        </Card>
    </>
  )
}

export default StepName