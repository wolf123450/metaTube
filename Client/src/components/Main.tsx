import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';

import VideoPage from './VideoPage';
import VideoList from './VideoList';
import AddVideoForm from "./AddVideoForm";

const Main: React.FC = () => {

    return (
        <Routes> {/* The Switch decides which component to show based on the current URL.*/}
            <Route path="/" element={<Navigate replace to="/VideoList" />} />    
            <Route path='/Video/:videoId' element={<VideoPage/>}></Route>
            <Route path='/VideoList' element={<VideoList/>}></Route>
            <Route path='/AddVideo' element={<AddVideoForm/>}></Route>
        </Routes>
    );
}

export default Main;