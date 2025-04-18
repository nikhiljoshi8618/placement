import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  Spinner,
  Dropdown,
  ProgressBar,
  Alert
} from "react-bootstrap";
import { motion } from "framer-motion";
import { db, storage } from "./firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs
} from "firebase/firestore";
import "./Admin.css";

const Admin = () => {
  const [placedStudents, setPlacedStudents] = useState([]);
  const [upcomingPlacements, setUpcomingPlacements] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlacedStudents = async () => {
      const querySnapshot = await getDocs(collection(db, "placed-students"));
      const students = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlacedStudents(students);
    };

    const fetchUpcomingPlacements = async () => {
      const querySnapshot = await getDocs(collection(db, "upcoming-placements"));
      const placements = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUpcomingPlacements(placements);
    };

    fetchPlacedStudents();
    fetchUpcomingPlacements();
    setIsLoading(false);
  }, []);

  const isValidFileType = (file) => {
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    return allowedTypes.includes(file.type);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && isValidFileType(file)) {
      setSelectedFile(file);
      setError("");
    } else {
      setError("Please select a valid PDF/DOC/DOCX file.");
      setSelectedFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && isValidFileType(file)) {
      setSelectedFile(file);
      setError("");
    } else {
      setError("Unsupported file type.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyName || !companyDescription || !selectedFile) {
      setError("All fields and a valid file are required.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      const fileRef = ref(storage, `upcoming-placements/${Date.now()}_${selectedFile.name}`);
      const uploadTask = uploadBytesResumable(fileRef, selectedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error(error);
          setError("Upload failed: " + error.message);
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, "upcoming-placements"), {
            companyName,
            description: companyDescription,
            fileURL: downloadURL,
            fileName: selectedFile.name,
            timestamp: serverTimestamp()
          });

          setUploadSuccess(true);
          setIsUploading(false);
          setCompanyName("");
          setCompanyDescription("");
          setSelectedFile(null);
          setUploadProgress(0);

          setTimeout(() => setUploadSuccess(false), 4000);
        }
      );
    } catch (err) {
      setError("Upload failed: " + err.message);
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" />
        <p>Loading TPO Panel...</p>
      </div>
    );
  }

  return (
    <Container fluid className="admin-container p-0">
      <motion.div
        className="tpo-header p-3 d-flex justify-content-between align-items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3>Welcome to TPO Panel</h3>
        <Dropdown align="end">
          <Dropdown.Toggle variant="light" id="dropdown-basic">
            Admin
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href="#/profile">My Profile</Dropdown.Item>
            <Dropdown.Item href="#/settings">Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item href="#/logout">Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </motion.div>

      <Row className="m-0">
        <Col md={6} className="p-3">
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>
                <i className="bi bi-people-fill me-2"></i>Manage Students
              </Card.Title>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <Card.Title>List of Placed Students</Card.Title>
              <div className="table-container">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Course</th>
                      <th>Company</th>
                      <th>Package</th>
                    </tr>
                  </thead>
                  <tbody>
                    {placedStudents.map((student, index) => (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>{student.name}</td>
                        <td>{student.course}</td>
                        <td>{student.company}</td>
                        <td>{student.package}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="p-3">
          <Card>
            <Card.Body>
              <Card.Title>
                <i className="bi bi-briefcase-fill me-2"></i>Upload Placement Opportunity
              </Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Company Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    required
                  />
                </Form.Group>

                <div
                  className="file-upload mt-3"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-input"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    hidden
                  />
                  <Button variant="secondary" onClick={() => document.getElementById("file-input").click()}>
                    <i className="bi bi-upload me-2"></i>
                    {selectedFile ? selectedFile.name : "Upload File"}
                  </Button>
                  <p className="text-muted mt-2">
                    Click or drag & drop a PDF/DOC/DOCX file
                  </p>
                </div>

                {isUploading && (
                  <div className="mt-3">
                    <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
                  </div>
                )}

                <Button type="submit" className="mt-4" disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Add Placement"}
                </Button>

                {uploadSuccess && (
                  <Alert variant="success" className="mt-3">
                    ✅ Placement uploaded successfully!
                  </Alert>
                )}

                {error && (
                  <Alert variant="danger" className="mt-3">
                    ⚠️ {error}
                  </Alert>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Admin;
