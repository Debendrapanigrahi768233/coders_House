import React,{useState,useEffect} from 'react'
import { useWebRtc } from '../../hooks/useWebRtc'
import {useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import styles from './Room.module.css'
import { useNavigate } from 'react-router-dom'
import { getRoom } from '../../http';

const Room = () => {
  const {id:roomId}=useParams()
  const user=useSelector((state)=>state.auth.user)
  const [isMuted, setMuted] = useState(true);
  const navigate=useNavigate()
  const [room, setRoom] = useState(null);

  const handManualLeave = () => {
    navigate('/rooms');
  };

  useEffect(() => {
      const fetchRoom = async () => {
          const { data } = await getRoom(roomId);
          console.log(data)
          setRoom((prev) => data);
      };

      fetchRoom();
  }, [roomId]);

  useEffect(() => {
    console.log(isMuted)
      handleMute(isMuted, user.id);
  }, [isMuted]);

  const handleMuteClick = (clientId) => {
    if (clientId !== user.id) {
        return;
    }
    setMuted((prev) => !prev);
};
  const {clients,provideRef,handleMute}=useWebRtc(roomId, user)

  return (
    <div>
      <div className="container">
        <button onClick={handManualLeave} className={styles.goBack}>
          <img src="/images/arrow-left.png" alt="backBtn" /> 
          <span>All voice rooms</span>
        </button>
      </div>
      <div className={styles.clientsWrap}>
        <div className={styles.header}>
            {room && <h2 className={styles.topic}>{room.topic}</h2>}
            <div className={styles.actions}>
                <button className={styles.actionBtn}>
                    <img src="/images/palm.png" alt="palm-icon" />
                </button>
                <button
                    onClick={handManualLeave}
                    className={styles.actionBtn}
                >
                    <img src="/images/win.png" alt="win-icon" />
                    <span>Leave quietly</span>
                </button>
            </div>
                
        </div>
        <div className={styles.clientsList}>
            
            {clients.map((client)=>{
              return(
              <div className={styles.client} key={client.id}>
                <div className={styles.userHead} >
                  <audio
                      autoPlay
                      ref={(instance) => {
                          provideRef(instance, client.id);
                      }}
                      
                  />
                  <img src={client.avatar} alt="avatar" className={styles.userAvatar}/>
                  <button
                      onClick={() =>
                          handleMuteClick(client.id)
                      }
                      className={styles.micBtn}
                  >
                      {client.muted ? (
                          <img
                              className={styles.mic}
                              src="/images/mic-mute.png"
                              alt="mic"
                          />
                      ) : (
                          <img
                              className={styles.micImg}
                              src="/images/mic.png"
                              alt="mic"
                          />
                      )}
                  </button>
                </div>
                <h4>{client.name}</h4>
              
              </div>
              )
            })}

        </div> 
        
      </div>
    </div> 
  )
}

export default Room