package com.web.unistudy_backend.Entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document(collection = "group_chats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupChat {
    @Id
    private String id;
    private String name;
    private String description;
    private String subject;
    private int maxCapacity;
    private String createdBy;
    private Date createdDate;
    private List<String> members;
}
