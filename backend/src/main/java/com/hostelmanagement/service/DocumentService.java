package com.hostelmanagement.service;

import com.hostelmanagement.entity.Document;
import com.hostelmanagement.entity.Student;
import com.hostelmanagement.exception.ResourceNotFoundException;
import com.hostelmanagement.repository.DocumentRepository;
import com.hostelmanagement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final StudentRepository studentRepository;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    public DocumentService(DocumentRepository documentRepository, StudentRepository studentRepository) {
        this.documentRepository = documentRepository;
        this.studentRepository = studentRepository;
    }

    public List<Document> getStudentDocuments(Long studentId) {
        return documentRepository.findByStudentId(studentId);
    }

    @Transactional
    public Document uploadDocument(Long studentId, String docTypeStr, MultipartFile file) throws IOException {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Document.DocumentType docType = Document.DocumentType.valueOf(docTypeStr.toUpperCase());

        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
        String extension = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx > 0) {
            extension = originalFilename.substring(dotIdx);
        }

        String storedFileName = "doc_" + studentId + "_" + docType.name() + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path targetPath = Paths.get(uploadDir).resolve(storedFileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Delete or replace existing document of the same type if present
        documentRepository.findByStudentIdAndDocumentType(studentId, docType).ifPresent(d -> {
            documentRepository.delete(d);
        });

        Document document = new Document(student, docType, originalFilename, "/api/documents/view/" + storedFileName);
        return documentRepository.save(document);
    }

    @Transactional
    public Document verifyDocument(Long docId, Document.VerificationStatus status) {
        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + docId));
        doc.setVerificationStatus(status);
        return documentRepository.save(doc);
    }
}
