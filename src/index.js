import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import InnerIC from './InnerIC';
import OuterIC from './OuterIC';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // React的严格模式会使得D3图表重复渲染两次，必须关闭
  // <React.StrictMode>
    // <InnerIC />
    <OuterIC />
  // </React.StrictMode>
);

