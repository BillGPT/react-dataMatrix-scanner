// App.js
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Navbar, Nav } from 'react-bootstrap';

import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AdminLogin from './Login';

//... 除了AdminLogin之外的其他组件和函数的定义在这里


function DataList() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://www.xihelin.com:15789/data', { withCredentials: true });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    fetchData();
  }, []);

  const copyAllToClipboard = () => {
    const text = data.map(item =>
      `${item.userId}\t${item.fengyin}\t${item.fengyin_n}\t${item.dianbiao}\t${new Date(item.timestamp).toLocaleString()}\t${item.files.join('\t')}`
    ).join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://www.xihelin.com:15789/data/${id}`, { withCredentials: true });
      // Then fetch data again after delete to keep the list updated
      const response = await axios.get('https://www.xihelin.com:15789/data', { withCredentials: true });
      setData(response.data);
    } catch (error) {
      console.error('Error deleting data', error);
    }
  };


  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>封印</th>
            <th>封印个数</th>
            <th>电表</th>
            <th>日期</th>
            <th>图片</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.userId}</td>
              <td>{item.fengyin}</td>
              <td>{item.fengyin_n}</td>
              <td>{item.dianbiao}</td>
              <td>{new Date(item.timestamp).toLocaleString()}</td>
              <td>
                {item.files.map((file, fileIndex) => (
                  <div key={fileIndex}>
                    <img src={file} alt={`file-${fileIndex}`} style={{ width: '100px', height: '100px' }} />
                  </div>
                ))}
              </td>
              <td><button onClick={() => handleDelete(item._id)}>删除</button></td>

            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={copyAllToClipboard}>复制所有数据</button>

    </div>
  );
}


function UserManagement() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    is_admin: false
  });

  // Declare fetchUsers outside of useEffect
  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://www.xihelin.com:15789/users', { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  useEffect(() => {
    // Call fetchUsers on component mount
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://www.xihelin.com:15789/user/${id}`);
      fetchUsers();  // Refresh users after deleting
    } catch (error) {
      console.error('Error deleting user', error);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      await axios.post('https://www.xihelin.com:15789/user/create', newUser);
      setNewUser({ username: '', password: '', name: '', is_admin: false });
      fetchUsers();  // Refresh users after creating
    } catch (error) {
      console.error('Error creating user', error);
    }
  };

  const handleChange = (event) => {
    setNewUser({ ...newUser, [event.target.name]: event.target.value });
  };

  const handleCheckboxChange = (event) => {
    setNewUser({ ...newUser, [event.target.name]: event.target.checked });
  };


  return (
    <div>
      <h2>用户管理</h2>
      <form onSubmit={handleCreate}>
        <input type="text" name="username" value={newUser.username} onChange={handleChange} placeholder="用户名" />
        <input type="password" name="password" value={newUser.password} onChange={handleChange} placeholder="密码" />
        <input type="text" name="name" value={newUser.name} onChange={handleChange} placeholder="姓名" />
        <label>
          <input type="checkbox" name="is_admin" checked={newUser.is_admin} onChange={handleCheckboxChange} />
          管理员权限
        </label>
        <button type="submit">创建</button>

      </form>
      <table className="table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>姓名</th>
            <th>管理员权限</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.name}</td>
              <td>{user.is_admin ? 'Yes' : 'No'}</td>
              <td><button onClick={() => handleDelete(user._id)}>删除</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function App() {
  const [cookies, setCookie, removeCookie] = useCookies(['admin']); // 注意这里添加了username
  const handleLogout = () => { // 添加退出登录的函数
    removeCookie('admin', { path: '/' });
  };

  const handleLogin = () => {
    setCookie('admin', true, { path: '/' });
  };

  return (
    <Router>
      <div className="container">
        {!cookies.admin && <AdminLogin onLogin={handleLogin} />}
        {cookies.admin &&
          <div>
            <button onClick={handleLogout} style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '12px' }}>
              退出登录
            </button>

            <Navbar bg="light" variant="light">
              <Nav className="mr-auto">
                <Nav.Link href="/">数据列表</Nav.Link>
                <Nav.Link href="/manage">用户管理</Nav.Link>
              </Nav>
            </Navbar>
            <Routes>
              <Route path="/" element={<DataList />} />
              <Route path="/manage" element={<UserManagement />} />
            </Routes>
          </div>
        }
      </div>
    </Router>
  );
}

export default App;
