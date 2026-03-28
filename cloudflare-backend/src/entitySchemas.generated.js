export const ENTITY_SCHEMAS = {
  "ApprovalRequest": {
    "name": "ApprovalRequest",
    "type": "object",
    "properties": {
      "collateral_id": {
        "type": "string"
      },
      "collateral_ref": {
        "type": "string"
      },
      "request_type": {
        "type": "string",
        "enum": [
          "onboarding",
          "valuation",
          "legal_clearance",
          "final_approval",
          "release",
          "revaluation"
        ],
        "default": "onboarding"
      },
      "requested_by": {
        "type": "string"
      },
      "assigned_to": {
        "type": "string"
      },
      "level": {
        "type": "number",
        "description": "Approval level (1, 2, 3)"
      },
      "status": {
        "type": "string",
        "enum": [
          "pending",
          "approved",
          "rejected",
          "escalated"
        ],
        "default": "pending"
      },
      "remarks": {
        "type": "string"
      },
      "decided_by": {
        "type": "string"
      },
      "decided_date": {
        "type": "string",
        "format": "date"
      },
      "loan_amount": {
        "type": "number"
      },
      "ltv_ratio": {
        "type": "number"
      },
      "priority": {
        "type": "string",
        "enum": [
          "low",
          "medium",
          "high",
          "urgent"
        ],
        "default": "medium"
      }
    },
    "required": [
      "collateral_id",
      "request_type"
    ]
  },
  "AuditLog": {
    "name": "AuditLog",
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "description": "Action performed"
      },
      "entity_type": {
        "type": "string",
        "description": "Which entity was affected"
      },
      "entity_id": {
        "type": "string"
      },
      "user_email": {
        "type": "string"
      },
      "user_name": {
        "type": "string"
      },
      "details": {
        "type": "string"
      },
      "ip_address": {
        "type": "string"
      },
      "branch": {
        "type": "string"
      },
      "changes": {
        "type": "object",
        "description": "Before/after snapshot"
      }
    },
    "required": [
      "action",
      "entity_type"
    ]
  },
  "Borrower": {
    "name": "Borrower",
    "type": "object",
    "properties": {
      "full_name": {
        "type": "string",
        "description": "Full legal name"
      },
      "pan_number": {
        "type": "string",
        "description": "PAN card number"
      },
      "aadhaar_number": {
        "type": "string",
        "description": "Aadhaar number (masked)"
      },
      "phone": {
        "type": "string"
      },
      "email": {
        "type": "string"
      },
      "address": {
        "type": "string"
      },
      "city": {
        "type": "string"
      },
      "state": {
        "type": "string"
      },
      "pincode": {
        "type": "string"
      },
      "borrower_type": {
        "type": "string",
        "enum": [
          "individual",
          "company",
          "partnership",
          "huf"
        ],
        "default": "individual"
      },
      "kyc_status": {
        "type": "string",
        "enum": [
          "pending",
          "verified",
          "rejected"
        ],
        "default": "pending"
      },
      "cibil_score": {
        "type": "number"
      },
      "branch": {
        "type": "string"
      },
      "documents": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "url": {
              "type": "string"
            },
            "type": {
              "type": "string"
            }
          }
        }
      }
    },
    "required": [
      "full_name"
    ]
  },
  "Branch": {
    "name": "Branch",
    "type": "object",
    "properties": {
      "name": {
        "type": "string"
      },
      "code": {
        "type": "string"
      },
      "city": {
        "type": "string"
      },
      "state": {
        "type": "string"
      },
      "region": {
        "type": "string"
      },
      "manager_email": {
        "type": "string"
      },
      "active": {
        "type": "boolean",
        "default": true
      }
    },
    "required": [
      "name",
      "code"
    ]
  },
  "Collateral": {
    "name": "Collateral",
    "type": "object",
    "properties": {
      "collateral_id": {
        "type": "string",
        "description": "Unique collateral reference ID"
      },
      "borrower_id": {
        "type": "string",
        "description": "Reference to Borrower"
      },
      "borrower_name": {
        "type": "string"
      },
      "type": {
        "type": "string",
        "enum": [
          "property",
          "gold",
          "vehicle"
        ],
        "default": "property"
      },
      "sub_type": {
        "type": "string",
        "description": "e.g., Residential, Commercial, Agricultural, 24K Gold, etc."
      },
      "description": {
        "type": "string"
      },
      "address": {
        "type": "string",
        "description": "Location/address of collateral"
      },
      "city": {
        "type": "string"
      },
      "state": {
        "type": "string"
      },
      "pincode": {
        "type": "string"
      },
      "market_value": {
        "type": "number",
        "description": "Current market value in INR"
      },
      "distress_value": {
        "type": "number",
        "description": "Distress/forced sale value in INR"
      },
      "loan_amount": {
        "type": "number",
        "description": "Sanctioned loan amount"
      },
      "ltv_ratio": {
        "type": "number",
        "description": "Loan-to-Value ratio %"
      },
      "status": {
        "type": "string",
        "enum": [
          "draft",
          "under_review",
          "legal_check",
          "valuation",
          "approved",
          "active",
          "released",
          "npa"
        ],
        "default": "draft"
      },
      "risk_score": {
        "type": "number",
        "description": "Computed risk score 0-100"
      },
      "risk_level": {
        "type": "string",
        "enum": [
          "low",
          "medium",
          "high",
          "critical"
        ],
        "default": "medium"
      },
      "branch": {
        "type": "string"
      },
      "legal_status": {
        "type": "string",
        "enum": [
          "pending",
          "clear",
          "encumbered",
          "disputed"
        ],
        "default": "pending"
      },
      "valuation_date": {
        "type": "string",
        "format": "date"
      },
      "next_revaluation_date": {
        "type": "string",
        "format": "date"
      },
      "insurance_expiry": {
        "type": "string",
        "format": "date"
      },
      "cersai_registered": {
        "type": "boolean",
        "default": false
      },
      "cersai_id": {
        "type": "string"
      },
      "geo_lat": {
        "type": "number"
      },
      "geo_lng": {
        "type": "number"
      },
      "fraud_flags": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "assigned_to": {
        "type": "string",
        "description": "Current handler email"
      },
      "documents": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "url": {
              "type": "string"
            },
            "type": {
              "type": "string"
            },
            "uploaded_date": {
              "type": "string"
            }
          }
        }
      }
    },
    "required": [
      "borrower_name",
      "type"
    ]
  },
  "LegalCheck": {
    "name": "LegalCheck",
    "type": "object",
    "properties": {
      "collateral_id": {
        "type": "string"
      },
      "collateral_ref": {
        "type": "string"
      },
      "officer_name": {
        "type": "string"
      },
      "officer_email": {
        "type": "string"
      },
      "title_status": {
        "type": "string",
        "enum": [
          "pending",
          "clear",
          "defective",
          "disputed"
        ],
        "default": "pending"
      },
      "encumbrance_status": {
        "type": "string",
        "enum": [
          "pending",
          "clear",
          "encumbered"
        ],
        "default": "pending"
      },
      "cersai_check": {
        "type": "string",
        "enum": [
          "pending",
          "clear",
          "registered_elsewhere"
        ],
        "default": "pending"
      },
      "checklist": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "item": {
              "type": "string"
            },
            "status": {
              "type": "string"
            },
            "remarks": {
              "type": "string"
            }
          }
        }
      },
      "risk_flags": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "overall_status": {
        "type": "string",
        "enum": [
          "pending",
          "approved",
          "rejected",
          "conditional"
        ],
        "default": "pending"
      },
      "remarks": {
        "type": "string"
      },
      "verification_date": {
        "type": "string",
        "format": "date"
      },
      "documents": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "url": {
              "type": "string"
            }
          }
        }
      }
    },
    "required": [
      "collateral_id"
    ]
  },
  "User": {
    "name": "User",
    "type": "object",
    "properties": {
      "full_name": {
        "type": "string",
        "description": "User full name"
      },
      "email": {
        "type": "string",
        "format": "email",
        "description": "User email address"
      },
      "role": {
        "type": "string",
        "enum": [
          "admin",
          "checker",
          "valuer",
          "legal_officer",
          "branch_manager",
          "user"
        ],
        "default": "user"
      },
      "branch": {
        "type": "string",
        "description": "Associated branch code"
      },
      "picture_url": {
        "type": "string",
        "description": "Profile picture URL"
      }
    },
    "required": [
      "full_name",
      "email"
    ]
  },
  "Valuation": {
    "name": "Valuation",
    "type": "object",
    "properties": {
      "collateral_id": {
        "type": "string"
      },
      "collateral_ref": {
        "type": "string",
        "description": "Collateral reference ID"
      },
      "valuer_name": {
        "type": "string"
      },
      "valuer_email": {
        "type": "string"
      },
      "valuation_type": {
        "type": "string",
        "enum": [
          "initial",
          "revaluation",
          "avm",
          "market_comparison"
        ],
        "default": "initial"
      },
      "market_value": {
        "type": "number"
      },
      "distress_value": {
        "type": "number"
      },
      "replacement_value": {
        "type": "number"
      },
      "valuation_date": {
        "type": "string",
        "format": "date"
      },
      "report_url": {
        "type": "string"
      },
      "status": {
        "type": "string",
        "enum": [
          "pending",
          "in_progress",
          "completed",
          "disputed"
        ],
        "default": "pending"
      },
      "remarks": {
        "type": "string"
      },
      "benchmark_data": {
        "type": "object",
        "properties": {
          "avg_area_rate": {
            "type": "number"
          },
          "comparable_sales": {
            "type": "number"
          },
          "variance_pct": {
            "type": "number"
          }
        }
      },
      "geo_tagged": {
        "type": "boolean",
        "default": false
      },
      "photos": {
        "type": "array",
        "items": {
          "type": "string"
        }
      }
    },
    "required": [
      "collateral_id"
    ]
  }
};
