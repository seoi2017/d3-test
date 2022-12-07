import React from 'react';
import ReactDOM from 'react-dom/client';
import { useSafeState } from 'ahooks';

import './index.css';

import InnerIC from './InnerIC';
import OuterIC from './OuterIC';
import ZoomIC from './ZoomIC';

const Chart = ({ chart }) => {
  switch (chart) {
    case 'innerIC':
      return <InnerIC />;
    case 'outerIC':
      return <OuterIC />;
    case 'zoomIC':
      return <ZoomIC />;
    default:
      return null;
  }
};

const BasePage = () => {
  const [chart, setChart] = useSafeState('innerIC');

  const triggers = (
    <div>
      <button onClick={() => setChart('innerIC')}>
        Inner Interactive Chart
      </button>
      <button onClick={() => setChart('outerIC')}>
        Outer Interactive Chart
      </button>
      <button onClick={() => setChart('zoomIC')}>
        Data & Zoom Interactive Chart
      </button>
    </div>
  );

  return (
    <>
      {triggers}
      <Chart chart={chart} />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // React的严格模式会使得D3图表重复渲染两次，必须关闭
  // <React.StrictMode>
    <BasePage />
  // </React.StrictMode>
);

