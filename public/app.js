
// ==========================================
// LEAVE MANAGEMENT SYSTEM - FRONTEND
// ==========================================

let currentUser = null;
let selectedRole = "student";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function hideAllSections() {
    document.getElementById("roleSection").classList.add("hidden");
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("registerSection").classList.add("hidden");
    document.getElementById("studentDashboard").classList.add("hidden");
    document.getElementById("staffDashboard").classList.add("hidden");
}

function showLogin(role) {
    selectedRole = role;
    hideAllSections();

    document.getElementById("loginSection").classList.remove("hidden");

    document.getElementById("loginTitle").textContent =
        role === "student" ? "Student Login" : "Staff Login";

    document.getElementById("registerText").style.display =
        role === "student" ? "block" : "none";
}

function goHome() {
    hideAllSections();
    document.getElementById("roleSection").classList.remove("hidden");
}

function showRegister() {
    hideAllSections();
    document.getElementById("registerSection").classList.remove("hidden");
}

function logout() {
    currentUser = null;
    goHome();
    alert("Logged out successfully!");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// ==========================================
// STUDENT REGISTRATION
// ==========================================

document.getElementById("registerForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const rollNumber = document.getElementById("regRollNumber").value.trim();

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password,
                rollNumber
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Registration failed!");
            return;
        }

        alert("Student registered successfully!");

        document.getElementById("registerForm").reset();
        showLogin("student");

    } catch (error) {
        console.error("Registration error:", error);
        alert("Unable to connect to the server!");
    }
});

// ==========================================
// LOGIN
// ==========================================

document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Invalid email or password!");
            return;
        }

        // IMPORTANT: Backend returns user details directly in data
        if (data.role !== selectedRole) {
            alert("This account does not belong to the selected portal.");
            return;
        }

        currentUser = data;

        document.getElementById("loginForm").reset();

        if (currentUser.role === "student") {
            openStudentDashboard();
        } else {
            openStaffDashboard();
        }

    } catch (error) {
        console.error("Login error:", error);
        alert("Unable to connect to the server!");
    }
});

// ==========================================
// STUDENT DASHBOARD
// ==========================================

function openStudentDashboard() {
    hideAllSections();

    document.getElementById("studentDashboard").classList.remove("hidden");

    document.getElementById("studentWelcome").textContent =
        "Welcome, " + currentUser.username;

    document.getElementById("casualBalance").textContent =
        currentUser.casualLeave;

    document.getElementById("medicalBalance").textContent =
        currentUser.medicalLeave;

    loadMyLeaves();
}

// ==========================================
// APPLY FOR LEAVE
// ==========================================

document.getElementById("leaveForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!currentUser) {
        alert("Please login first!");
        return;
    }

    const leaveType = document.getElementById("leaveType").value;
    const numberOfDays = Number(
        document.getElementById("numberOfDays").value
    );
    const reason = document.getElementById("leaveReason").value.trim();

    if (
        !leaveType ||
        !Number.isInteger(numberOfDays) ||
        numberOfDays <= 0 ||
        !reason
    ) {
        alert("Please enter valid leave details!");
        return;
    }

    try {
        const response = await fetch(
            `/api/leaves/apply/${currentUser.userId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    leaveType,
                    numberOfDays,
                    reason
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Leave application failed!");
            return;
        }

        alert("Leave application submitted successfully!");

        document.getElementById("leaveForm").reset();

        loadMyLeaves();

    } catch (error) {
        console.error("Leave application error:", error);
        alert("Unable to connect to the server!");
    }
});

// ==========================================
// VIEW STUDENT LEAVE HISTORY
// ==========================================

async function loadMyLeaves() {
    if (!currentUser) return;

    const container = document.getElementById("myLeaves");

    try {
        const response = await fetch(
            `/api/leaves/my-leaves/${currentUser.userId}`
        );

        const data = await response.json();

        if (!response.ok) {
            container.textContent =
                data.message || "Unable to load applications.";
            return;
        }

        if (data.length === 0) {
            container.innerHTML = "<p>No leave applications found.</p>";
            return;
        }

        container.innerHTML = data.map(leave => `
            <div class="leave-item">

                <p><strong>Leave Type:</strong>
                    ${escapeHTML(leave.leaveType)}
                </p>

                <p><strong>Number of Days:</strong>
                    ${escapeHTML(leave.numberOfDays)}
                </p>

                <p><strong>Reason:</strong>
                    ${escapeHTML(leave.reason)}
                </p>

                <p><strong>Applied Date:</strong>
                    ${escapeHTML(
                        new Date(leave.appliedDate).toLocaleDateString()
                    )}
                </p>

                <p class="status">
                    <strong>Status:</strong>
                    ${escapeHTML(leave.status)}
                </p>

                ${leave.status === "Rejected" ? `
                    <p><strong>Rejection Reason:</strong>
                        ${escapeHTML(leave.rejectionReason)}
                    </p>
                ` : ""}

            </div>
        `).join("");

    } catch (error) {
        console.error("Leave history error:", error);
        container.textContent = "Unable to load leave applications.";
    }
}

// ==========================================
// STAFF DASHBOARD
// ==========================================

async function openStaffDashboard() {
    hideAllSections();

    document.getElementById("staffDashboard").classList.remove("hidden");

    loadStaffApplications();
}

// ==========================================
// VIEW STUDENT APPLICATIONS
// ==========================================

async function loadStaffApplications() {
    if (!currentUser) return;

    const container = document.getElementById("staffApplications");

    container.innerHTML = "<p>Loading applications...</p>";

    try {
        const response = await fetch("/api/staff/applications", {
            headers: {
                "x-user-id": currentUser.userId
            }
        });

        const data = await response.json();

        if (!response.ok) {
            container.textContent =
                data.message || "Unable to load applications.";
            return;
        }

        if (data.length === 0) {
            container.innerHTML =
                "<p>No leave applications available.</p>";
            return;
        }

        container.innerHTML = data.map(leave => `
            <div class="leave-item">

                <h3>Student:
                    ${escapeHTML(leave.studentId?.username)}
                </h3>

                <p><strong>Roll Number:</strong>
                    ${escapeHTML(leave.studentId?.rollNumber)}
                </p>

                <p><strong>Email:</strong>
                    ${escapeHTML(leave.studentId?.email)}
                </p>

                <p><strong>Leave Type:</strong>
                    ${escapeHTML(leave.leaveType)}
                </p>

                <p><strong>Number of Days:</strong>
                    ${escapeHTML(leave.numberOfDays)}
                </p>

                <p><strong>Reason:</strong>
                    ${escapeHTML(leave.reason)}
                </p>

                <p><strong>Applied Date:</strong>
                    ${escapeHTML(
                        new Date(leave.appliedDate).toLocaleDateString()
                    )}
                </p>

                <p class="status">
                    <strong>Status:</strong>
                    ${escapeHTML(leave.status)}
                </p>

                ${leave.status === "Pending" ? `
                    <button onclick="approveLeave('${leave._id}')">
                        Approve
                    </button>

                    <button onclick="rejectLeave('${leave._id}')">
                        Reject
                    </button>
                ` : ""}

                ${leave.status === "Rejected" ? `
                    <p><strong>Rejection Reason:</strong>
                        ${escapeHTML(leave.rejectionReason)}
                    </p>
                ` : ""}

            </div>
        `).join("");

    } catch (error) {
        console.error("Staff dashboard error:", error);
        container.textContent = "Unable to connect to the server.";
    }
}

// ==========================================
// APPROVE LEAVE
// ==========================================

async function approveLeave(leaveId) {
    const confirmApproval = confirm(
        "Are you sure you want to approve this leave?"
    );

    if (!confirmApproval) return;

    await updateLeaveDecision(leaveId, "Approved", "");
}

// ==========================================
// REJECT LEAVE
// ==========================================

async function rejectLeave(leaveId) {
    const rejectionReason = prompt(
        "Enter the reason for rejecting this leave:"
    );

    if (rejectionReason === null) return;

    if (!rejectionReason.trim()) {
        alert("Rejection reason is required!");
        return;
    }

    await updateLeaveDecision(
        leaveId,
        "Rejected",
        rejectionReason.trim()
    );
}

// ==========================================
// UPDATE STAFF DECISION
// ==========================================

async function updateLeaveDecision(
    leaveId,
    status,
    rejectionReason
) {
    try {
        const response = await fetch(
            `/api/staff/decision/${leaveId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": currentUser.userId
                },
                body: JSON.stringify({
                    status,
                    rejectionReason
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to update leave status!");
            return;
        }

        alert(`Leave ${status.toLowerCase()} successfully!`);

        loadStaffApplications();

    } catch (error) {
        console.error("Staff decision error:", error);
        alert("Unable to connect to the server!");
    }
}
