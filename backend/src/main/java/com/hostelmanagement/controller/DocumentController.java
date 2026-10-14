package com.hostelmanagement.controller;

import com.hostelmanagement.dto.ApiResponse;
import com.hostelmanagement.entity.Document;
import com.hostelmanagement.entity.Student;
import com.hostelmanagement.security.UserPrincipal;
import com.hostelmanagement.service.DocumentService;
import com.hostelmanagement.service.StudentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final StudentService studentService;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    public DocumentController(DocumentService documentService, StudentService studentService) {
        this.documentService = documentService;
        this.studentService = studentService;
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Document>> uploadDocument(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file) throws IOException {

        Student student = studentService.getStudentByUserId(userPrincipal.getId());
        Document doc = documentService.uploadDocument(student.getId(), documentType, file);
        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully", doc));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<Document>>> getStudentDocuments(@PathVariable Long studentId) {
        List<Document> docs = documentService.getStudentDocuments(studentId);
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved", docs));
    }

    @GetMapping("/my-documents")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<Document>>> getMyDocuments(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Student student = studentService.getStudentByUserId(userPrincipal.getId());
        List<Document> docs = documentService.getStudentDocuments(student.getId());
        return ResponseEntity.ok(ApiResponse.success("My documents retrieved", docs));
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<Document>> verifyDocument(@PathVariable Long id,
                                                                @RequestParam String status) {
        Document verified = documentService.verifyDocument(id, Document.VerificationStatus.valueOf(status.toUpperCase()));
        return ResponseEntity.ok(ApiResponse.success("Document verification status updated", verified));
    }

    @GetMapping("/view/{filename:.+}")
    public ResponseEntity<Resource> viewFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                String contentType = "application/octet-stream";
                if (filename.endsWith(".pdf")) contentType = "application/pdf";
                else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) contentType = "image/jpeg";
                else if (filename.endsWith(".png")) contentType = "image/png";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
