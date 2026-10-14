package com.hostelmanagement.repository;

import com.hostelmanagement.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByStudentId(Long studentId);
    Optional<Document> findByStudentIdAndDocumentType(Long studentId, Document.DocumentType documentType);
}
