package com.sliit.paf.smart_campus.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mongo-test")
public class TestMongoController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping
    public String testMongo() {
        try {
            String dbName = mongoTemplate.getDb().getName();
            return "Connected to MongoDB database: " + dbName;
        } catch (Exception e) {
            return "MongoDB connection failed: " + e.getMessage();
        }
    }
}
