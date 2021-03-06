import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';

import VideoPage from './VideoPage.js';
import VideoList from './VideoList.js';
import AddVideoForm from "./AddVideoForm.js";

function Main(props) {

    return (
        <Routes> {/* The Switch decides which component to show based on the current URL.*/}
            <Route path="/" element={<Navigate replace to="/VideoList" />} />    
            <Route exact path='/Video/:videoId' element={<VideoPage/>}></Route>
            <Route exact path='/VideoList' element={<VideoList/>}></Route>
            <Route exact path='/AddVideo' element={<AddVideoForm/>}></Route>
        </Routes>
    );
}

export default Main;