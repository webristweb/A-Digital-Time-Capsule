// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const createCapsuleSection = document.getElementById('create-capsule-section');
const unlockCapsuleSection = document.getElementById('unlock-capsule-section');
const adminSection = document.getElementById('admin-section');

const loginForm = document.getElementById('login-form');
const biometricBtn = document.getElementById('biometric-btn');
const loginMsg = document.getElementById('login-message');
const userNameSpan = document.getElementById('user-name');
const createCapsuleBtn = document.getElementById('create-capsule-btn');
const unlockCapsuleBtn = document.getElementById('unlock-capsule-btn');
const adminBtn = document.getElementById('admin-btn');
const logoutBtn = document.getElementById('logout-btn');
const capsuleForm = document.getElementById('capsule-form');
const encryptCapsuleBtn = document.getElementById('encrypt-capsule-btn');
const capsuleCreateMsg = document.getElementById('capsule-create-message');
const backDashboardBtn1 = document.getElementById('back-dashboard-btn1');
const backDashboardBtn2 = document.getElementById('back-dashboard-btn2');
const backDashboardBtn3 = document.getElementById('back-dashboard-btn3');
const biometricUnlockBtn = document.getElementById('biometric-unlock-btn');
const unlockMsg = document.getElementById('unlock-message');
const adminMetadata = document.getElementById('admin-metadata');
const adminBlockchain = document.getElementById('admin-blockchain');
const removeExpiredBtn = document.getElementById('remove-expired-btn');
const capsuleFileInput = document.getElementById('capsule-file');
const filePreviewDiv = document.getElementById('file-preview');

// Storage Keys
const USERS_KEY = 'timevault_users';
const CURRENT_USER_KEY = 'timevault_current_user';

// Helper: Section Switch
function showSection(section) {
  [loginSection, dashboardSection, createCapsuleSection, unlockCapsuleSection, adminSection].forEach(s => s.classList.remove('active'));
  section.classList.add('active');
  if (section === dashboardSection) {
    renderDashboardStats();
    renderCapsuleList();
  }
}

// Simulated Biometric (random success)
function simulateBiometric() {
  return Math.random() > 0.2; // 80% success
}

// User Auth
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}
function setUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}
function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}
function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  showSection(loginSection);
}

// Capsule helpers (per user)
function getUserCapsules(username) {
  const users = getUsers();
  const user = users.find(u => u.username === username);
  return user ? (user.capsules || []) : [];
}
function setUserCapsules(username, capsules) {
  const users = getUsers();
  const idx = users.findIndex(u => u.username === username);
  if (idx !== -1) {
    users[idx].capsules = capsules;
    setUsers(users);
  }
}

// Toast notification logic
function showToast(msg, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = 0;
    setTimeout(() => toast.remove(), 500);
  }, 2500);
}

// Biometric modal logic
function showBiometricModal(text = 'Scanning...') {
  const modal = document.getElementById('biometric-modal');
  const modalText = document.getElementById('biometric-modal-text');
  modalText.textContent = text;
  modal.style.display = 'flex';
}
function hideBiometricModal() {
  const modal = document.getElementById('biometric-modal');
  modal.style.display = 'none';
}

// Password hashing (SHA-256)
async function hashPassword(password) {
  return await window.CryptoUtils.sha256(password);
}

// Dashboard stats
function renderDashboardStats() {
  const currentUser = getCurrentUser();
  const users = getUsers();
  const user = users.find(u => u.username === currentUser.username);
  let total = 0, unlocked = 0, locked = 0;
  if (user && user.capsules) {
    total = user.capsules.length;
    const now = new Date();
    user.capsules.forEach(c => {
      const unlockDate = new Date(c.metadata.unlockDate);
      if (c.unlocked) unlocked++;
      else if (now < unlockDate) locked++;
      else locked++;
    });
  }
  const statsDiv = document.getElementById('dashboard-stats');
  statsDiv.innerHTML = `
    <div class="stats-card"><b>Total</b><br>${total}</div>
    <div class="stats-card"><b>Unlocked</b><br>${unlocked}</div>
    <div class="stats-card"><b>Locked</b><br>${locked}</div>
  `;
}

// Login/Register (with password hash)
biometricBtn.onclick = async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  if (!username || !password) {
    showToast('Enter username and password.', 'error');
    return;
  }
  const hashedPassword = await hashPassword(password);
  showBiometricModal('Scanning for login...');
  setTimeout(async () => {
    const success = Math.random() > 0.2;
    hideBiometricModal();
    if (success) {
      let users = getUsers();
      let user = users.find(u => u.username === username);
      if (!user) {
        // Register new user
        user = { username, password: hashedPassword, capsules: [] };
        users.push(user);
        setUsers(users);
      } else if (user.password !== hashedPassword) {
        showToast('Incorrect password.', 'error');
        return;
      }
      setCurrentUser({ username });
      userNameSpan.textContent = username;
      showSection(dashboardSection);
      showToast('Login successful!', 'success');
    } else {
      showToast('Biometric verification failed. Try again!', 'error');
    }
  }, 1500);
};

// Prevent default form submission
loginForm.onsubmit = (e) => { e.preventDefault(); };
// Allow Enter key in password field to trigger biometric login
const passwordInput = document.getElementById('password');
passwordInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    biometricBtn.click();
  }
});

// Dashboard Navigation
createCapsuleBtn.onclick = () => {
  showSection(createCapsuleSection);
  capsuleCreateMsg.textContent = '';
};
backDashboardBtn1.onclick = backDashboardBtn2.onclick = backDashboardBtn3.onclick = () => {
  showSection(dashboardSection);
};
logoutBtn.onclick = logout;

// File input change handler
if (capsuleFileInput) {
  capsuleFileInput.onchange = function(e) {
    const file = e.target.files[0];
    capsuleFileData = null;
    filePreviewDiv.innerHTML = '';
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        capsuleFileData = {
          name: file.name,
          type: file.type,
          data: evt.target.result
        };
        if (file.type.startsWith('image/')) {
          filePreviewDiv.innerHTML = `<img src="${evt.target.result}" alt="preview" style="max-width:100px;max-height:100px;" />`;
        } else if (file.type === 'application/pdf') {
          filePreviewDiv.innerHTML = `<span>PDF attached: ${file.name}</span>`;
        } else {
          filePreviewDiv.innerHTML = `<span>File attached: ${file.name}</span>`;
        }
      };
      reader.readAsDataURL(file);
    }
  };
}

// Capsule Creation (show toast)
encryptCapsuleBtn.onclick = async () => {
  const message = document.getElementById('capsule-message').value.trim();
  const unlockDate = document.getElementById('unlock-date').value;
  const currentUser = getCurrentUser();
  if (!message || !unlockDate) {
    showToast('Enter message and unlock date.', 'error');
    return;
  }
  showBiometricModal('Scanning to create capsule...');
  setTimeout(async () => {
    const users = getUsers();
    const userIdx = users.findIndex(u => u.username === currentUser.username);
    if (userIdx === -1) {
      showToast('User not found.', 'error');
      hideBiometricModal();
      return;
    }
    const password = users[userIdx].password;
    const encrypted = await window.CryptoUtils.aesEncrypt(message, password);
    const metadata = {
      username: currentUser.username,
      unlockDate,
      created: new Date().toISOString(),
      file: capsuleFileData ? { name: capsuleFileData.name, type: capsuleFileData.type } : null
    };
    const metadataStr = JSON.stringify(metadata);
    const metadataHash = await window.CryptoUtils.sha256(metadataStr);
    window.Blockchain.addBlock(metadataHash);
    const capsule = { encrypted, metadata };
    if (capsuleFileData) {
      capsule.fileData = capsuleFileData.data;
    }
    users[userIdx].capsules = users[userIdx].capsules || [];
    users[userIdx].capsules.push(capsule);
    setUsers(users);
    capsuleFileInput.value = '';
    capsuleFileData = null;
    filePreviewDiv.innerHTML = '';
    hideBiometricModal();
    showToast('Capsule created & secured!', 'success');
    renderDashboardStats();
    renderCapsuleList();
  }, 1500);
};

// Capsule Unlock
unlockCapsuleBtn.onclick = () => {
  showSection(unlockCapsuleSection);
  unlockMsg.textContent = '';
};
biometricUnlockBtn.onclick = async () => {
  const currentUser = getCurrentUser();
  const users = getUsers();
  const user = users.find(u => u.username === currentUser.username);
  if (!user || !user.capsules || user.capsules.length === 0) {
    unlockMsg.textContent = 'No capsule found.';
    return;
  }
  // For now, unlock the latest capsule
  const capsule = user.capsules[user.capsules.length - 1];
  const now = new Date();
  const unlockDate = new Date(capsule.metadata.unlockDate);
  if (now < unlockDate) {
    unlockMsg.textContent = `Unlock date not reached. Try after ${capsule.metadata.unlockDate}`;
    return;
  }
  unlockMsg.textContent = 'Simulating biometric...';
  setTimeout(async () => {
    if (simulateBiometric()) {
      try {
        const decrypted = await window.CryptoUtils.aesDecrypt(capsule.encrypted, user.password);
        unlockMsg.textContent = 'Capsule Unlocked! Message: ' + decrypted;
      } catch {
        unlockMsg.textContent = 'Decryption failed. Wrong password?';
      }
    } else {
      unlockMsg.textContent = 'Biometric verification failed.';
    }
  }, 1200);
};

// Admin Panel
adminBtn.onclick = () => {
  showSection(adminSection);
  renderAdmin();
};
function renderAdmin() {
  // Metadata
  const currentUser = getCurrentUser();
  const users = getUsers();
  const user = users.find(u => u.username === currentUser.username);
  let metaHtml = '';
  if (user && user.capsules && user.capsules.length > 0) {
    metaHtml = user.capsules.map((c, i) => `<b>Capsule #${i+1} Metadata:</b><br><pre>${JSON.stringify(c.metadata, null, 2)}</pre>`).join('<hr>');
  } else {
    metaHtml = 'No capsule.';
  }
  adminMetadata.innerHTML = metaHtml;
  // Blockchain
  const chain = window.Blockchain.getChain();
  adminBlockchain.innerHTML = `<b>Blockchain Log:</b><br><pre>${JSON.stringify(chain, null, 2)}</pre>`;
}
removeExpiredBtn.onclick = () => {
  const currentUser = getCurrentUser();
  const users = getUsers();
  const userIdx = users.findIndex(u => u.username === currentUser.username);
  if (userIdx === -1) return;
  let removed = false;
  users[userIdx].capsules = (users[userIdx].capsules || []).filter(c => {
    if (new Date() > new Date(c.metadata.unlockDate)) {
      removed = true;
      return false;
    }
    return true;
  });
  setUsers(users);
  adminMetadata.innerHTML = removed ? 'Expired capsules removed!' : 'No expired capsule to remove.';
  renderAdmin();
};

// Add capsule list/history UI to dashboard
function renderCapsuleList() {
  const currentUser = getCurrentUser();
  const users = getUsers();
  const user = users.find(u => u.username === currentUser.username);
  const dashboard = dashboardSection;
  let listDiv = document.getElementById('capsule-list');
  if (!listDiv) {
    listDiv = document.createElement('div');
    listDiv.id = 'capsule-list';
    dashboard.appendChild(listDiv);
  }
  if (!user || !user.capsules || user.capsules.length === 0) {
    listDiv.innerHTML = '<p>No capsules found.</p>';
    return;
  }
  let html = '<h3>Your Capsules</h3><ul style="list-style:none;padding:0;">';
  user.capsules.forEach((c, i) => {
    const now = new Date();
    const unlockDate = new Date(c.metadata.unlockDate);
    let status = '';
    if (now < unlockDate) status = '🔒 Locked';
    else if (c.unlocked) status = '✅ Unlocked';
    else status = '🕒 Ready to Unlock';
    html += `<li style="margin-bottom:1rem;padding:1rem;background:rgba(255,255,255,0.8);border-radius:1rem;box-shadow:0 2px 8px #eee;">
      <b>Capsule #${i+1}</b> <br>
      <span>Unlock Date: ${c.metadata.unlockDate}</span><br>
      <span>Status: ${status}</span><br>`;
    if (c.unlocked) {
      html += `<div style="margin-top:0.5rem;"><b>Message:</b> <span>${c.decryptedMsg}</span></div>`;
      if (c.fileData && c.metadata.file) {
        if (c.metadata.file.type.startsWith('image/')) {
          html += `<div><b>File:</b> <a href="${c.fileData}" download="${c.metadata.file.name}">Download Image</a> | <a href="${c.fileData}" target="_blank">View</a></div>`;
        } else if (c.metadata.file.type === 'application/pdf') {
          html += `<div><b>File:</b> <a href="${c.fileData}" download="${c.metadata.file.name}">Download PDF</a> | <a href="${c.fileData}" target="_blank">View</a></div>`;
        } else {
          html += `<div><b>File:</b> <a href="${c.fileData}" download="${c.metadata.file.name}">Download</a></div>`;
        }
      }
    } else if (now >= unlockDate) {
      html += `<button onclick="unlockCapsuleFromList(${i})">Unlock</button>`;
    }
    html += '</li>';
  });
  html += '</ul>';
  listDiv.innerHTML = html;
}

// Unlock capsule from list (with modal and toast)
window.unlockCapsuleFromList = async function(idx) {
  const currentUser = getCurrentUser();
  const users = getUsers();
  const userIdx = users.findIndex(u => u.username === currentUser.username);
  if (userIdx === -1) return;
  const user = users[userIdx];
  const capsule = user.capsules[idx];
  const now = new Date();
  const unlockDate = new Date(capsule.metadata.unlockDate);
  if (now < unlockDate) {
    showToast('Unlock date not reached!', 'error');
    return;
  }
  showBiometricModal('Scanning to unlock...');
  setTimeout(async () => {
    const success = Math.random() > 0.2;
    hideBiometricModal();
    if (!success) {
      showToast('Biometric verification failed!', 'error');
      return;
    }
    try {
      const decrypted = await window.CryptoUtils.aesDecrypt(capsule.encrypted, user.password);
      user.capsules[idx].unlocked = true;
      user.capsules[idx].decryptedMsg = decrypted;
      setUsers(users);
      renderCapsuleList();
      renderDashboardStats();
      showToast('Capsule unlocked!', 'success');
    } catch {
      showToast('Decryption failed. Wrong password?', 'error');
    }
  }, 1500);
};

// On Load: Auto-login if user exists
window.onload = () => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    userNameSpan.textContent = currentUser.username;
    showSection(dashboardSection);
  } else {
    showSection(loginSection);
  }
}; 