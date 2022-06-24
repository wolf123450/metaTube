import React from "react";
import { Routes, Route } from 'react-router-dom';

import VideoPage from './VideoPage.js';
import VideoList from './VideoList.js';

function Main(props) {

    return (
        <Routes> {/* The Switch decides which component to show based on the current URL.*/}
            <Route exact path='/Video/:videoId' element={<VideoPage/>}></Route>
            <Route exact path='/VideoList' element={<VideoList/>}></Route>
        </Routes>
    );
}

export default Main;