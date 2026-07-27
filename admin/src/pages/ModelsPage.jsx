import { useEffect, useState } from 'react';
import { Select } from 'antd';
import CrudResourcePage from './CrudResourcePage';
import {
  getModels,
  createModel,
  updateModel,
  deleteModel,
  getBrands,
} from '../services/adminService';

export default function ModelsPage() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    getBrands().then((res) => setBrands(res.data.data)).catch(() => {});
  }, []);

  return (
    <CrudResourcePage
      title="Models"
      listFn={getModels}
      createFn={createModel}
      updateFn={updateModel}
      deleteFn={deleteModel}
      fields={[
        { name: 'name', label: 'Model Name', required: true },
        {
          name: 'brand',
          label: 'Brand',
          required: true,
          render: (v, row) => row.brand?.name || v,
          input: (
            <Select
              options={brands.map((b) => ({ value: b._id, label: b.name }))}
              placeholder="Select brand"
            />
          ),
        },
      ]}
    />
  );
}
